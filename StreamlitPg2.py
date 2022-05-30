import pandas as pd
import streamlit as st
from streamlit_folium import folium_static
import folium
import geopandas as gpd

st.set_page_config(layout="wide")

fname='map.geojson'
nil = gpd.read_file(fname)

m = folium.Map(location=[45.752, 21.22], zoom_start=13, tiles="CartoDB positron")


choice = ['PretMediu', 'PretMinim', 'PretMaxim', 'PretMetru', 'NumarAnunturi']

choice_selected = st.selectbox("Alegeți o opțiune pentru a fi reprezentată", choice)

df=pd.read_csv('sql_query.csv')
fname='map.geojson'
nil = gpd.read_file(fname)
nil = nil[['id', 'geometry']]
df_final = nil.merge(df, left_on="id", right_on="id", how="outer")


choropleth1 = folium.Choropleth(
    geo_data='map.geojson',
    data=df_final,
    columns=['id', choice_selected],
    key_on='feature.properties.id',
    fill_color='Blues',
    line_color = 'White',
    nan_fill_color="White",
    fill_opacity=0.7,
    line_opacity=0.2,
    legend_name=choice_selected
).geojson.add_to(m)

style_function = lambda x: {'fillColor': '#ffffff',
                            'color': '#000000',
                            'fillOpacity': 0.2,
                            'weight': 0.2}
highlight_function = lambda x: {'fillColor': '#263393',
                                'color': '#ffffff',
                                'fillOpacity': 0.85,
                                'weight': 0.1}

NIL = folium.features.GeoJson(

    df_final,
    style_function=style_function,
    control=False,
    highlight_function=highlight_function,
    tooltip=folium.features.GeoJsonTooltip(
        fields=['text', choice_selected],
        aliases=['Nume Regiune: ', 'Reprezentare alegere '],
        style=("background-color: white; color: #333333; font-family: arial; font-size: 14px; padding: 10px;")
    )
)
m.add_child(NIL)
m.keep_in_front(NIL)
folium.LayerControl().add_to(m)


folium_static(m, width=1600, height=900)
