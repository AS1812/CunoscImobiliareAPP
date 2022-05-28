from bs4 import BeautifulSoup
import requests
import pymysql
from sqlalchemy import create_engine
import pandas as pd

locatii = []
nr_camere = []
metriipatrati = []
preturi = []
pret_final = []
valuta = []
valoare_bruta = []

page = 1
first_page = "https://www.imobiliare.ro/vanzare-apartamente/timis?id=26646339&pagina=1"
response = requests.get(first_page)
pagina = response.text
first_soup = BeautifulSoup(pagina, "html.parser")
imobiliare_nr_anunturi = first_soup.find(name="span", class_="total_anunturi_js hidden-xs grey_counter")
nr_anunturi = int(imobiliare_nr_anunturi.getText())
nr_pagini = nr_anunturi / 30

if nr_pagini - int(nr_pagini) != 0:
    nr_pagini = int(nr_pagini) + 1
else:
    nr_pagini = int(nr_pagini)

nr_pg = 10  # doar pentru test, in rest se foloseste nr_pagini"
while page <= nr_pagini:
    url = f"https://www.imobiliare.ro/vanzare-apartamente/timis?id=26646339&pagina={page}"
    response = requests.get(url)
    imobiliare_web_page = response.text
    soup = BeautifulSoup(imobiliare_web_page, "html.parser")
    imobiliare_locatie = soup.find_all(name="p", class_="location_txt")
    if soup.find(name="div", class_="pret necomunicat"):
        pass
    else:
        for locatie in imobiliare_locatie:
            locatii.append(locatie.getText().strip().replace("ş", "s").replace("Ş", "S")
                           .replace("â", "a").replace("ţ", "t").replace("Î", "I").replace("ă", "a"))
        imobiliare_valuta = soup.find_all(name="span", class_="tva-luna")
        for val in imobiliare_valuta:
            valuta.append(val.getText())
        imobiliare_pret = soup.find_all(name="span", class_="pret-mare")
        for pret in imobiliare_pret:
            try:
                pret = (float(pret.getText())*1000)
                preturi.append(pret)
            except:
                preturi.append("Valoare eronata site")

        imobiliare_caracteristici = soup.find_all(name="ul", class_="caracteristici")
        for caracteristici in imobiliare_caracteristici:
            if caracteristici.getText().strip().split()[0] == "o":
                nr_camere.append(1)
            elif len(caracteristici.getText().strip().split()[0]) > 5:
                nr_camere.append("Valoare eronata site")
            else:
                nr_camere.append(int(caracteristici.getText().strip().split()[0]))

            try:
                converted_mp = caracteristici.getText().strip().split()[2].replace(",", ".")
                if float(converted_mp) < 1000:
                    metriipatrati.append(float(converted_mp))
                else:
                    metriipatrati.append("Valoare eronata site") #"Metrii patrati declarati eronat"
            except:
                metriipatrati.append("Valoare eronata site") #"Metrii patrați nedeclarati de catre proprietar"
    if len(locatii) < nr_anunturi:
        page = page + 1

#  Calcularea valorii brute ce reprezintă defapt prețul împărțit la numărul de metrii pătrați
for i in range(len(preturi)):
    try:
        if valuta[i] == "EUR + TVA":
            pret_val = preturi[i] + (preturi[i] * 0.19)
        else:
            pret_val = preturi[i]
        pret_final.append(pret_val)
        valb = round(pret_val / metriipatrati[i])
        if 500 < valb < 5000:
            valoare_bruta.append(valb)
        else:
            valoare_bruta.append("Valoare eronata site")
    except:
        valoare_bruta.append("Valoare eronata site")

# Valoarea medie finală dintre pret/metri pătrați în toată Timișoara
min_val = min(i for i in valoare_bruta if i != "Valoare eronata site")
index = valoare_bruta.index(min_val)

suma = 0
valoare_bruta_medie = 0
for k in valoare_bruta:
    if k != "Valoare eronata site":
        if k < 10000:
            suma = suma + k
valoare_bruta_medie = suma / (len(valoare_bruta) - valoare_bruta.count(None))

#  Adaugarea datelor colectate în serverul propriu de baze de date MySQL
sql_list = []
sql_list = [tuple(index) for index in zip(locatii, preturi, valuta, nr_camere, pret_final, metriipatrati, valoare_bruta)]
print(sql_list)

sqlconnection = pymysql.connect(host="localhost", user="AS", password="Bella-4-ever1556")
cursor = sqlconnection.cursor()

sql = "DROP DATABASE IF EXISTS PROIECT_DIPLOMA;"
cursor.execute(sql)

sql = "CREATE DATABASE IF NOT EXISTS PROIECT_DIPLOMA;"
cursor.execute(sql)

sql = "USE PROIECT_DIPLOMA;"
cursor.execute(sql)

sql = "CREATE TABLE Imobiliare (ID int NOT NULL AUTO_INCREMENT," \
      " LocatieApartament varchar(255)," \
      " Pret varchar(255)," \
      " Valuta varchar(255)," \
      " NumarCamere varchar(255)," \
      " MetriiPatrati varchar(255)," \
      " PretFinal varchar(255)," \
      " PretMetruPatrat varchar(255)," \
      " PRIMARY KEY(ID));"
cursor.execute(sql)

with sqlconnection.cursor() as cursor:
    cursor.executemany("insert into imobiliare(LocatieApartament, Pret, Valuta, NumarCamere, PretFinal,"
                       " MetriiPatrati, PretMetruPatrat) values (%s, %s, %s, %s, %s, %s, %s)", sql_list)
    sqlconnection.commit()


#  Sectiune de afisare
#print(cursor.fetchall())
#print(locatii[index], " ", nr_camere[index], " Camere ", preturi[index], " ", valuta[index], " ", metriipatrati[index],
#      " ", "Pret/MetriiPatrati:", valoare_bruta[index], valuta[index])
print(len(locatii))
print(len(preturi))
print(len(metriipatrati))
print(len(nr_camere))
print(len(valoare_bruta))
print(locatii)
print(nr_camere)
print(metriipatrati)
print(preturi)
print(valuta)
print(valoare_bruta)
print("Media preturilor per metru patrat in Timișoara este: ", "{:.2f}".format(valoare_bruta_medie), "Euro")