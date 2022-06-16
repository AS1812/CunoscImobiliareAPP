import sqlalchemy
import pandas as pd

sqlEngine = sqlalchemy.create_engine('mysql+pymysql://AS:Bella-4-ever1556@localhost:3306/Proiect_Diploma')
dbConnection = sqlEngine.connect()
tableName = "Imobiliare"

sql = '''select id, count(*) as NumarAnunturi, LocatieApartament as ZonăApartament, 
       AVG(Pret) AS PretMediu, Min(Pret) as PretMinim, MAX(Pret) as PretMaxim, 
       AVG(MetriPatrati) as MetriPartrati_InMedie, Pret/MetriPatrati as PretMediu_MetruPatrat from imobiliare 
  	     where NumarCamere = 1 and locatieapartament in ("Timisoara, zona Complex Studentesc",
  	     "Timisoara, zona Elisabetin", "Timisoara, zona Iosefin", 
  	     "Timisoara, zona Blascovici", "Timisoara, zona Torontalului",
  	     "Timisoara, zona Aradului",  "Timisoara, zona Lipovei", 
  	     "Timisoara, zona Telegrafului", "Timisoara, zona Dorobantilor", 
  	     "Timisoara, zona Fabric", "Timisoara, zona Cetatii") 
	     group by ZonăApartament;'''

df1 = pd.read_sql_query(sql, sqlEngine, index_col="ZonăApartament")
df1.to_csv('sql_query_1cam.csv')

sql = '''select id, count(*) as NumarAnunturi, LocatieApartament as ZonăApartament, 
       AVG(Pret) AS PretMediu, Min(Pret) as PretMinim, MAX(Pret) as PretMaxim, 
       AVG(MetriPatrati) as MetriPartrati_InMedie, Pret/MetriPatrati as PretMediu_MetruPatrat from imobiliare 
  	     where NumarCamere = 2 and locatieapartament in ("Timisoara, zona Complex Studentesc",
  	     "Timisoara, zona Elisabetin", "Timisoara, zona Iosefin", 
  	     "Timisoara, zona Blascovici", "Timisoara, zona Torontalului",
  	     "Timisoara, zona Aradului",  "Timisoara, zona Lipovei", 
  	     "Timisoara, zona Telegrafului", "Timisoara, zona Dorobantilor", 
  	     "Timisoara, zona Fabric", "Timisoara, zona Cetatii") 
	     group by ZonăApartament;'''

df2 = pd.read_sql_query(sql, sqlEngine, index_col="ZonăApartament")
df2.to_csv('sql_query_2cam.csv')

sql = '''select id, count(*) as NumarAnunturi, LocatieApartament as ZonăApartament, 
       AVG(Pret) AS PretMediu, Min(Pret) as PretMinim, MAX(Pret) as PretMaxim, 
       AVG(MetriPatrati) as MetriPartrati_InMedie, Pret/MetriPatrati as PretMediu_MetruPatrat from imobiliare 
  	     where NumarCamere = 3 and locatieapartament in ("Timisoara, zona Complex Studentesc",
  	     "Timisoara, zona Elisabetin", "Timisoara, zona Iosefin", 
  	     "Timisoara, zona Blascovici", "Timisoara, zona Torontalului",
  	     "Timisoara, zona Aradului",  "Timisoara, zona Lipovei", 
  	     "Timisoara, zona Telegrafului", "Timisoara, zona Dorobantilor", 
  	     "Timisoara, zona Fabric", "Timisoara, zona Cetatii") 
	     group by ZonăApartament;'''

df3 = pd.read_sql_query(sql, sqlEngine, index_col="ZonăApartament")
df3.to_csv('sql_query_3cam.csv')

sql = '''select id, count(*) as NumarAnunturi, LocatieApartament as ZonăApartament, 
       AVG(Pret) AS PretMediu, Min(Pret) as PretMinim, MAX(Pret) as PretMaxim, 
       AVG(MetriPatrati) as MetriPartrati_InMedie, Pret/MetriPatrati as PretMediu_MetruPatrat from imobiliare 
  	     where NumarCamere = 4 and locatieapartament in ("Timisoara, zona Complex Studentesc",
  	     "Timisoara, zona Elisabetin", "Timisoara, zona Iosefin", 
  	     "Timisoara, zona Blascovici", "Timisoara, zona Torontalului",
  	     "Timisoara, zona Aradului",  "Timisoara, zona Lipovei", 
  	     "Timisoara, zona Telegrafului", "Timisoara, zona Dorobantilor", 
  	     "Timisoara, zona Fabric", "Timisoara, zona Cetatii") 
	     group by ZonăApartament;'''

df4 = pd.read_sql_query(sql, sqlEngine, index_col="ZonăApartament")
df4.to_csv('sql_query_4cam.csv')

sql = '''select id, count(*) as NumarAnunturi, LocatieApartament as ZonăApartament, 
       AVG(Pret) AS PretMediu, Min(Pret) as PretMinim, MAX(Pret) as PretMaxim, 
       AVG(MetriPatrati) as MetriPartrati_InMedie, Pret/MetriPatrati as PretMediu_MetruPatrat from imobiliare 
  	     where NumarCamere = 5 or NumarCamere = 6 and locatieapartament in ("Timisoara, zona Complex Studentesc",
  	     "Timisoara, zona Elisabetin", "Timisoara, zona Iosefin", 
  	     "Timisoara, zona Blascovici", "Timisoara, zona Torontalului",
  	     "Timisoara, zona Aradului",  "Timisoara, zona Lipovei", 
  	     "Timisoara, zona Telegrafului", "Timisoara, zona Dorobantilor", 
  	     "Timisoara, zona Fabric", "Timisoara, zona Cetatii") 
	     group by ZonăApartament;'''

df5 = pd.read_sql_query(sql, sqlEngine, index_col="ZonăApartament")
df5.to_csv('sql_query_4cam.csv')