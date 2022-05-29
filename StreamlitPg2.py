import pandas as pd
import streamlit as st
from streamlit_folium import folium_static
import folium
import geopandas as gpd

st.set_page_config(layout="wide")

fname='map.geojson'
nil = gpd.read_file(fname)

m = folium.Map(location=[45.752, 21.22], zoom_start=13)

timisoara_imobiliare = f"timisoara_date.csv"
timisoara_imobiliare_date = pd.read_csv(timisoara_imobiliare)

choice = ['PretMediu', 'PretMinim', 'PretMaxim', 'PretMetru']
choice_selected = st.selectbox("Select Choice", choice)

df4=pd.read_csv('final_csv.csv')
nil = nil[['id', 'geometry']]
df_final = nil.merge(df4, left_on="id", right_on="id", how="outer")

m = folium.Map(location=[45.752, 21.22], zoom_start=13)

choropleth1 = folium.Choropleth(
    geo_data='map.geojson',
    data=df_final,
    columns=['id', choice_selected],
    key_on='feature.properties.id',
    fill_color='YlGn',
    fill_opacity=0.7,
    line_opacity=0.2
).geojson.add_to(m)


folium.features.GeoJson('map.geojson',
                        name="Regiuni",
                        popup=folium.features.GeoJsonPopup(fields=['text'], aliases=['Nume Regiune: '])
                        ).add_to(m)

folium_static(m, width=1600, height=900)
