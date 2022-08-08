from flask import Flask, request, jsonify, make_response, render_template
from flask_cors import cross_origin
import numpy as np
from os import listdir
from os.path import abspath, dirname, join
from pyproj import Transformer
import rasterio
import json

# Define the application directory
BASE_DIR = dirname(abspath(__file__))

app = Flask(__name__)

# retorna el html de la visualizacion permitiendo que el navegardo la renderice.
@app.route('/')
def home():
    return render_template('index.html')

#recibe como parametros, en ruta, las coordenadas de la ubicacion, en formato Grados decimales (DD)
#retorna la informacion de los datos para la ubicacion en formato json
@app.route('/api/v1/data', methods=['GET'])
@cross_origin()
def get_data():
    longitude = request.args.get("longitude")
    latitude = request.args.get("latitude")

    if longitude and latitude :
        path = join(BASE_DIR, 'data')
        files = listdir(path)
        files_tif = [f for f  in files if f[-3:] == 'tif']
        c={}
        for f in files_tif:
            with rasterio.open(join(path, f)) as raster:
                var = f.replace('_rfcovar.tif', '')
                transformer = Transformer.from_crs("EPSG:4326", raster.crs, always_xy=True)
                xx, yy = transformer.transform(longitude, latitude)
                value = list(raster.sample([(xx, yy)]))[0][0]
                c[var] = round(np.float64(value), 5)
        normal = False

        for dato in c.values():
            if dato != -3.3999999521443642e+38:
                normal = True
        if normal:
            c["Ca_Mg"] = round(c["Ca"] / c["Mg"], 5)
            c["Ca_K"] = round(c["Ca"] / c["K"], 5)
            c["Mg_K"] = round(c["Mg"] / c["K"], 5)
            c["K_Mg"] = round(c["K"] / c["Mg"], 5)
            print('Para las coordenadas:', 'Latitud: '+ latitude, 'Longitud: ' + longitude, 'los datos son: ', sep='\n' )
            print(c)
            return jsonify(c)
        else:
            print('las coordenadas:', 'Latitud: '+ latitude, 'Longitud: ' + longitude, 'estan fuera de los limites', sep='\n' )
            return jsonify({
                'message': "Coordenadas fuera de los limites"
            })
    else:
        return jsonify({
            'message': "No hay Longitud o Latitud"
        })


#retorna informacion relacionada a los datos como son nombre de la variable, descripcion
#siglas y unidades, ademas de los grupos para generar algunas graficas a partir de los datos, 
#en formato json.
@app.route('/api/v1/infodatos', methods=['GET'])
@cross_origin()
def get_info():
    data = {}
    with open(join(BASE_DIR,'data/infodatos.json'), encoding="utf-8") as file:   
        data = json.load(file)
    return data



if __name__ == '__main__':
    # run app in debug mode on port 5000
    app.run(debug=True, port=5000)
