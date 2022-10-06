from unicodedata import numeric
from flask import Flask, request, jsonify, make_response, render_template
from flask_cors import cross_origin
import numpy as np
from os import listdir
from os.path import abspath, dirname, join
from pyproj import Transformer
import rasterio
import json
import pandas as pd

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

    try:
        longitude = request.args.get("longitude")
        latitude = request.args.get("latitude")
        if longitude and latitude :

            if int(float(latitude)) > 90 or int(float(latitude)) < -90:
                return jsonify({
                    'message': "Latitud por fuera de los valores normales"
                })

            if int(float(longitude)) > 180 or int(float(longitude)) < -180:
                return jsonify({
                    'message': "Longitud por fuera de los valores normales"
                })
            path = join(BASE_DIR, 'data')
            files = listdir(path)
            files_tif = [f for f  in files if f[-3:] == 'tif']
            c={}
            for f in files_tif:
                if '_rfcovar.tif' in f :
                    with rasterio.open(join(path, f)) as raster:
                        var = f.replace('_rfcovar.tif', '')
                        transformer = Transformer.from_crs("EPSG:4326", raster.crs, always_xy=True)
                        xx, yy = transformer.transform(longitude, latitude)
                        value = list(raster.sample([(xx, yy)]))[0][0]
                        c[var] = round(np.float64(value), 5)
            normal = True

            for dato in c.values():
                if dato == -3.3999999521443642e+38:
                    normal = False

            f = "clusters.tif"
            numClus= 0
            c['cluster'] = {}

            with rasterio.open(join(path, f)) as raster:
                transformer = Transformer.from_crs("EPSG:4326", raster.crs, always_xy=True)
                xx, yy = transformer.transform(longitude, latitude)
                value = list(raster.sample([(xx, yy)]))[0][0]
                numClus = int(np.float64(value))

            if numClus == -3.3999999521443642e+38:
                c['cluster'] = {'message': "No hay zona Edafoclimática para estas coordenadas"}
            else:
                df = pd.read_excel(join(path, 'data_clusters.xlsx'), usecols=["variable", "rango", f'C{numClus}'])
                df.fillna(0, inplace=True)
                c['cluster']['numCluster'] = numClus
                for index, row in df.iterrows():
                    if not row['variable'] in c['cluster'] :
                        c['cluster'][row['variable']] = {}
                    c['cluster'][row['variable']][row['rango']] = row[f'C{numClus}']

            if normal:
                c["Ca_Mg"] = round(c["Ca"] / c["Mg"], 5)
                c["Ca_K"] = round(c["Ca"] / c["K"], 5)
                c["Mg_K"] = round(c["Mg"] / c["K"], 5)
                c["K_Mg"] = round(c["K"] / c["Mg"], 5)

                df = pd.read_excel(join( path,"rangos_texturales.xlsx"), usecols=['ARENAS','LIMOS','ARCILLAS','clase','simbolo' ])

                for index,row in df.iterrows():
                    rango = row['ARENAS'].split('-')
                    if c['ARENAS'] >= np.float32(rango[0]) and c['ARENAS'] < np.float32(rango[1]):
                        rango = df.iloc[index]['ARCILLAS'].split('-')
                        if c['ARCILLAS'] >= np.float32(rango[0]) and c['ARCILLAS'] < np.float32(rango[1]):
                            rango = df.iloc[index]['LIMOS'].split('-')
                            if c['LIMOS'] >= np.float32(rango[0]) and c['LIMOS'] < np.float32(rango[1]):
                                c['textura'] = df.iloc[index, 3]
                                c['simboloTextu'] = df.iloc[index, 4]

                fertilidad = c['FERTILIDAD']
                if fertilidad < 3.6:
                    c['fertilidad'] = 'Muy baja'
                elif fertilidad <= 5.1:
                    c['fertilidad'] = 'Baja'
                elif fertilidad <= 6.7:
                    c['fertilidad'] = 'Moderada'
                elif fertilidad <= 8.3:
                    c['fertilidad'] = 'Alta'
                else :
                    c['fertilidad'] = 'Muy alta'

                print('Para las coordenadas:', 'Latitud: '+ latitude, 'Longitud: ' + longitude, 'los datos son: ', sep='\n' )
                print(c)
                return jsonify(c)
            else:
                print('las coordenadas:', 'Latitud: '+ latitude, 'Longitud: ' + longitude, 'estan fuera de los limites', sep='\n' )
                return jsonify({
                    'message': "Coordenadas por fuera del area de estudio"
                })
        else:
            return jsonify({
                'message': "No hay Longitud o Latitud"
            })
    except Exception as e:
        print("type error: " + str(e))
        return jsonify({
                'message': "Error en el servidor"
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


@app.route('/api/v1/cluster', methods=['GET'])
@cross_origin()
def get_cluster():

    try:
        longitude = request.args.get("longitude")
        latitude = request.args.get("latitude")
        if longitude and latitude :

            if int(float(latitude)) > 90 or int(float(latitude)) < -90:
                return jsonify({
                    'message': "Latitud por fuera de los valores normales"
                })

            if int(float(longitude)) > 180 or int(float(longitude)) < -180:
                return jsonify({
                    'message': "Longitud por fuera de los valores normales"
                })
            path = join(BASE_DIR, 'data')
            f = "clusters.tif"
            c= 0
            with rasterio.open(join(path, f)) as raster:
                transformer = Transformer.from_crs("EPSG:4326", raster.crs, always_xy=True)
                xx, yy = transformer.transform(longitude, latitude)
                value = list(raster.sample([(xx, yy)]))[0][0]
                c = int(np.float64(value))

            normal = True
            
            if c == -3.3999999521443642e+38:
                normal = False
            if normal:
                df = pd.read_excel(path+ "\data_clusters.xlsx", usecols=["variable", "rango", f'C{c}'])
                df.fillna(0, inplace=True)
                cluster = {}
                cluster['numCluster'] = c
                for index, row in df.iterrows():
                    if not row['variable'] in cluster :
                        cluster[row['variable']] = {}
                    cluster[row['variable']][row['rango']] = row[f'C{c}'] 

                print('Para las coordenadas:', 'Latitud: '+ latitude, 'Longitud: ' + longitude, 'los datos del cluster son: ', sep='\n' )
                print(cluster)
                return jsonify(cluster)
            else:
                print('las coordenadas:', 'Latitud: '+ latitude, 'Longitud: ' + longitude, 'estan fuera de los limites', sep='\n' )
                return jsonify({
                    'message': "No hay zona Edafoclimática para estas coordenadas"
                })
        else:
            return jsonify({
                'message': "No hay Longitud o Latitud"
            })
    except Exception as e:
        print("type error: " + str(e))
        return jsonify({
                'message': "Error en el servidor"
            })


if __name__ == '__main__':
    # run app in debug mode on port 5000
    app.run(debug=True, port=5000)
