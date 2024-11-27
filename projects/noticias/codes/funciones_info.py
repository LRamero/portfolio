import requests
from gdeltdoc import GdeltDoc, Filters
import pycountry

def obtener_clima(lat, lon, api_key):
    url = f"https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    respuesta = requests.get(url)
    if respuesta.status_code == 200:
        datos = respuesta.json()
        return datos
    else:
        return None
    
def obtener_coord(direccion, api_key):
    url = f"https://us1.locationiq.com/v1/search?key={api_key}&q={direccion}&format=json"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        lat = data[0]["lat"]
        lon = data[0]["lon"]
        return lat, lon
    else:
        return None, None
    
def traducir_texto(texto, clave_api, idioma_destino):
    url = "https://api-free.deepl.com/v2/translate"

    parametros = {
        "auth_key": clave_api,
        "text": texto,
        "target_lang": idioma_destino
    }

    respuesta = requests.post(url, data=parametros)

    if respuesta.status_code == 200:
        datos_respuesta = respuesta.json()
        return datos_respuesta['translations'][0]['text']
    else:
        print("Error en la traducción:", respuesta.status_code, respuesta.text)
        return None
    
def obtener_noticias(query, start_date, end_date, pais = None):
    fips_codes = {
        "AF": "AF",  # Afghanistan
        "AL": "AL",  # Albania
        "DZ": "AG",  # Algeria
        "AS": "AQ",  # American Samoa
        "AD": "AN",  # Andorra
        "AO": "AO",  # Angola
        "AI": "AV",  # Anguilla
        "AG": "AC",  # Antigua and Barbuda
        "AR": "AR",  # Argentina
        "AM": "AM",  # Armenia
        "AW": "AA",  # Aruba
        "AU": "AS",  # Australia
        "AT": "AU",  # Austria
        "AZ": "AJ",  # Azerbaijan
        "BS": "BF",  # Bahamas
        "BH": "BA",  # Bahrain
        "BD": "BG",  # Bangladesh
        "BB": "BB",  # Barbados
        "BY": "BO",  # Belarus
        "BE": "BE",  # Belgium
        "BZ": "BH",  # Belize
        "BJ": "BN",  # Benin
        "BM": "BD",  # Bermuda
        "BT": "BT",  # Bhutan
        "BO": "BL",  # Bolivia
        "BA": "BK",  # Bosnia and Herzegovina
        "BW": "BC",  # Botswana
        "BR": "BR",  # Brazil
        "BN": "BX",  # Brunei
        "BG": "BU",  # Bulgaria
        "BF": "UV",  # Burkina Faso
        "BI": "BY",  # Burundi
        "KH": "CB",  # Cambodia
        "CM": "CM",  # Cameroon
        "CA": "CA",  # Canada
        "CV": "CV",  # Cape Verde
        "KY": "CJ",  # Cayman Islands
        "CF": "CT",  # Central African Republic
        "TD": "CD",  # Chad
        "CL": "CI",  # Chile
        "CN": "CH",  # China
        "CO": "CO",  # Colombia
        "KM": "CN",  # Comoros
        "CG": "CF",  # Congo (Brazzaville)
        "CD": "CG",  # Congo (Kinshasa)
        "CR": "CS",  # Costa Rica
        "CI": "IV",  # Cote d'Ivoire
        "HR": "HR",  # Croatia
        "CU": "CU",  # Cuba
        "CY": "CY",  # Cyprus
        "CZ": "EZ",  # Czechia
        "DK": "DA",  # Denmark
        "DJ": "DJ",  # Djibouti
        "DM": "DO",  # Dominica
        "DO": "DR",  # Dominican Republic
        "EC": "EC",  # Ecuador
        "EG": "EG",  # Egypt
        "SV": "ES",  # El Salvador
        "GQ": "EK",  # Equatorial Guinea
        "ER": "ER",  # Eritrea
        "EE": "EN",  # Estonia
        "SZ": "WZ",  # Eswatini
        "ET": "ET",  # Ethiopia
        "FJ": "FJ",  # Fiji
        "FI": "FI",  # Finland
        "FR": "FR",  # France
        "GA": "GB",  # Gabon
        "GM": "GA",  # Gambia
        "GE": "GG",  # Georgia
        "DE": "GM",  # Germany
        "GH": "GH",  # Ghana
        "GR": "GR",  # Greece
        "GD": "GJ",  # Grenada
        "GT": "GT",  # Guatemala
        "GN": "GV",  # Guinea
        "GW": "PU",  # Guinea-Bissau
        "GY": "GY",  # Guyana
        "HT": "HA",  # Haiti
        "HN": "HO",  # Honduras
        "HU": "HU",  # Hungary
        "IS": "IC",  # Iceland
        "IN": "IN",  # India
        "ID": "ID",  # Indonesia
        "IR": "IR",  # Iran
        "IQ": "IZ",  # Iraq
        "IE": "EI",  # Ireland
        "IL": "IS",  # Israel
        "IT": "IT",  # Italy
        "JM": "JM",  # Jamaica
        "JP": "JA",  # Japan
        "JO": "JO",  # Jordan
        "KZ": "KZ",  # Kazakhstan
        "KE": "KE",  # Kenya
        "KI": "KR",  # Kiribati
        "KW": "KU",  # Kuwait
        "KG": "KG",  # Kyrgyzstan
        "LA": "LA",  # Laos
        "LV": "LG",  # Latvia
        "LB": "LE",  # Lebanon
        "LS": "LT",  # Lesotho
        "LR": "LI",  # Liberia
        "LY": "LY",  # Libya
        "LT": "LH",  # Lithuania
        "LU": "LU",  # Luxembourg
        "MG": "MA",  # Madagascar
        "MW": "MI",  # Malawi
        "MY": "MY",  # Malaysia
        "MV": "MV",  # Maldives
        "ML": "ML",  # Mali
        "MT": "MT",  # Malta
        "MH": "RM",  # Marshall Islands
        "MR": "MR",  # Mauritania
        "MU": "MP",  # Mauritius
        "MX": "MX",  # Mexico
        "FM": "FM",  # Micronesia
        "MD": "MD",  # Moldova
        "MC": "MN",  # Monaco
        "MN": "MG",  # Mongolia
        "ME": "MJ",  # Montenegro
        "MA": "MO",  # Morocco
        "MZ": "MZ",  # Mozambique
        "MM": "BM",  # Myanmar
        "NA": "WA",  # Namibia
        "NR": "NR",  # Nauru
        "NP": "NP",  # Nepal
        "NL": "NL",  # Netherlands
        "NZ": "NZ",  # New Zealand
        "NI": "NU",  # Nicaragua
        "NE": "NG",  # Niger
        "NG": "NI",  # Nigeria
        "NO": "NO",  # Norway
        "OM": "MU",  # Oman
        "PK": "PK",  # Pakistan
        "PW": "PS",  # Palau
        "PA": "PM",  # Panama
        "PG": "PP",  # Papua New Guinea
        "PY": "PA",  # Paraguay
        "PE": "PE",  # Peru
        "PH": "RP",  # Philippines
        "PL": "PL",  # Poland
        "PT": "PO",  # Portugal
        "QA": "QA",  # Qatar
        "RO": "RO",  # Romania
        "RU": "RS",  # Russia
        "RW": "RW",  # Rwanda
        "WS": "WS",  # Samoa
        "SM": "SM",  # San Marino
        "ST": "TP",  # Sao Tome and Principe
        "SA": "SA",  # Saudi Arabia
        "SN": "SG",  # Senegal
        "RS": "RI",  # Serbia
        "SC": "SE",  # Seychelles
        "SL": "SL",  # Sierra Leone
        "SG": "SN",  # Singapore
        "SK": "LO",  # Slovakia
        "SI": "SI",  # Slovenia
        "SB": "BP",  # Solomon Islands
        "SO": "SO",  # Somalia
        "ZA": "SF",  # South Africa
        "SS": "OD",  # South Sudan
        "ES": "SP",  # Spain
        "LK": "CE",  # Sri Lanka
        "SD": "SU",  # Sudan
        "SR": "NS",  # Suriname
        "SE": "SW",  # Sweden
        "CH": "SZ",  # Switzerland
        "SY": "SY",  # Syria
        "TW": "TW",  # Taiwan
        "TJ": "TI",  # Tajikistan
        "TZ": "TZ",  # Tanzania
        "TH": "TH",  # Thailand
        "TL": "TT",  # Timor-Leste
        "TG": "TO",  # Togo
        "TK": "TK",  # Tokelau
        "TO": "TN",  # Tonga
        "TT": "TR",  # Trinidad and Tobago
        "TN": "TS",  # Tunisia
        "TR": "TU",  # Turkey
        "TM": "TM",  # Turkmenistan
        "TC": "TK",  # Turks and Caicos Islands
        "TV": "TV",  # Tuvalu
        "UG": "UG",  # Uganda
        "UA": "UP",  # Ukraine
        "AE": "AE",  # United Arab Emirates
        "GB": "UK",  # United Kingdom
        "US": "US",  # United States
        "UY": "UY",  # Uruguay
        "UZ": "UZ",  # Uzbekistan
        "VU": "VU",  # Vanuatu
        "VE": "VE",  # Venezuela
        "VN": "VM",  # Vietnam
        "WF": "WF",  # Wallis and Futuna
        "YE": "YE",  # Yemen
        "ZM": "ZA",  # Zambia
        "ZW": "ZW",  # Zimbabwe
    }

    def obtener_codigo_pais(nombre_pais):
        country = pycountry.countries.lookup(nombre_pais)
        if country:
            return fips_codes.get(country.alpha_2.upper(), "AR") 
        else: 
            return "AR"
        
    codigo = obtener_codigo_pais(pais)

    f = Filters(
        keyword = query,
        start_date = start_date,
        end_date = end_date,
        num_records = 25,
        country = [codigo, "AR"]
    )

    gd = GdeltDoc()
    return gd.article_search(f).to_dict(orient='records')

def obtener_sugerencias(api_key_sug, ciudad):
    url = f"https://api.locationiq.com/v1/autocomplete?key={api_key_sug}&q={ciudad}&limit=5&dedupe=1&tag=place%3Acountry%2Cplace%3Astate%2Cplace%3Aregion%2Cplace%3Aprovince%2Cplace%3Acountry%2Cplace%3Acity"
    return requests.get(url)