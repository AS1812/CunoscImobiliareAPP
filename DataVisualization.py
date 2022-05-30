import folium
import sqlalchemy
import pandas as pd
import geopandas as gpd
import plotly.express as px
import matplotlib.pyplot as plt

sqlEngine = sqlalchemy.create_engine('mysql+pymysql://AS:Bella-4-ever1556@localhost:3306/Proiect_Diploma')
dbConnection = sqlEngine.connect()
tableName = "Imobiliare"

"""
sql = "select distinct locatieapartament, count(*) as nr_aparitii " \
      "from imobiliare " \
      "group by locatieapartament " \
      "limit 15;"
df1 = pd.read_sql_query(sql, sqlEngine)
fig = px.pie(labels=df1.locatieapartament, values=df1.nr_aparitii, names=df1.locatieapartament, height=1150,
             title="Top 15 locații în Timișoara. în funcție de numărul de anunțuri")
fig.update_traces(textposition='outside', textinfo='percent+label')
fig.show()

sql = "select locatieapartament, avg(pretmetrupatrat) as medie from imobiliare " \
      "group by locatieapartament " \
      "order by medie desc " \
      "limit 25;"
df2 = pd.read_sql_query(sql, sqlEngine)
h_bar = px.bar(x=df2.medie,
               y=df2.locatieapartament,
               orientation='h',
               color=df2.medie,
               title='Top 25 locații în Timișoara cu cel mai mare preț per metru pătrat',
               color_continuous_scale='Blues')
h_bar.update_layout(xaxis_title='Metri pătrați', yaxis_title='Locații', yaxis=dict(autorange="reversed"), height=900)
h_bar.show()

sql = "select locatieapartament, avg(pret) as PretMediu, " \
      "avg(metripatrati) as MetriParatiMedii, avg(pret)/avg(metripatrati) as PretMetruPatrat " \
      "from imobiliare " \
      "where pret is not NULL " \
      "and metripatrati is not NULL " \
      "group by locatieapartament " \
      "order by PretMetruPatrat asc;"
df3 = pd.read_sql_query(sql, sqlEngine)
scatter = px.scatter(df3,
                     x="PretMediu",  # column name
                     y="MetriParatiMedii",
                     title='Reprezentarea grafică a pretului per metru patrat în funcție de locație',
                     color="PretMetruPatrat",
                     hover_name="locatieapartament",
                     hover_data=["PretMediu", "MetriParatiMedii"])
scatter.update_layout(xaxis_title="Preț",
                      yaxis_title="Metri pătrați", )
scatter.show()
"""
sql = '''select id, locatieapartament as text, AVG(Pret) AS PretMediu, Min(Pret) as PretMinim, MAX(Pret) as PretMaxim, 
       AVG(MetriPatrati) as MetriPartrati, Pret/MetriPatrati as PretMetru, count(*) as NumarAnunturi from imobiliare 
  	     where locatieapartament like 'Timisoara, zona Complex Studentesc' 
  	     or locatieapartament like 'Timisoara, zona Elisabetin' 
   	     or locatieapartament like 'Timisoara, zona Iosefin' 
    	 or locatieapartament like 'Timisoara, zona Blascovici' 
     	 or locatieapartament like 'Timisoara, zona Torontalului' 
      	 or locatieapartament like 'Timisoara, zona Torontalului' 
       	 or locatieapartament like 'Timisoara, zona Aradului' 
         or locatieapartament like 'Timisoara, zona Lipovei' 
         or locatieapartament like 'Timisoara, zona Telegrafului' 
	     or locatieapartament like 'Timisoara, zona Dorobantilor' 
	     or locatieapartament like 'Timisoara, zona Fabric' 
	     or locatieapartament like 'Timisoara, zona Cetatii' 
       group by locatieapartament;'''

df4 = pd.read_sql_query(sql, sqlEngine, index_col='id')
df4.to_csv('sql_query.csv')
#df4.to_csv('timisoara_date.csv')
df4_final=pd.read_csv('sql_query.csv')
fname='map.geojson'
nil = gpd.read_file(fname)
nil = nil[['id','geometry']]
df_final = nil.merge(df4_final, left_on="id", right_on="id", how="outer")
#df_final.to_csv("final_csv.csv")

m = folium.Map(location=[45.752, 21.22], zoom_start=13, tiles= "CartoDB positron")

choropleth1 = folium.Choropleth(
    geo_data='map.geojson',
    data=df_final,
    columns=['id', "PretMetru"],
    key_on='feature.properties.id',
    fill_color='BuGn',
    nan_fill_color="white",
    fill_opacity=0.7,
    line_opacity=0.2,

).geojson.add_to(m)

style_function = lambda x: {'fillColor': '#ffffff',
                            'color': '#ffffff',
                            'fillOpacity': 0.1,
                            'weight': 0.2}
highlight_function = lambda x: {'fillColor': '#000000',
                                'color': '#000000',
                                'fillOpacity': 0.50,
                                'weight': 0.1}

NIL = folium.features.GeoJson(
    df_final,
    style_function=style_function,
    control=False,
    highlight_function=highlight_function,
    tooltip=folium.features.GeoJsonTooltip(
        fields=['text', 'PretMediu'],
        aliases=['Nume Regiune: ', 'Preț mediu per metru pătrat '],
        style=("background-color: white; color: #333333; font-family: arial; font-size: 12px; padding: 10px;")
    )
)

m.add_child(NIL)
m.keep_in_front(NIL)
folium.LayerControl().add_to(m)

m.save('index.html')