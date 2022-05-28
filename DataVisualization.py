import sqlalchemy
import pandas as pd
import plotly.express as px
import matplotlib.pyplot as plt

sqlEngine = sqlalchemy.create_engine('mysql+pymysql://AS:Bella-4-ever1556@localhost:3306/Proiect_Diploma')
dbConnection = sqlEngine.connect()
tableName = "Imobiliare"


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
