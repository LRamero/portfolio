import pandas as pd
import pickle
import sys

def get_pds():
    url = 'https://drive.google.com/file/d/1NulAOMTMRPDzsfh9-DBMdiiPlKQWZoEH/view?usp=sharing'
    path = 'https://drive.google.com/uc?export=download&id=' + url.split('/')[-2]
    pk1 = pd.read_csv(path)
    pk1.rename(columns = {'Name':'Nombre', 'Species':'Especie', 'Variant':'Variante', 'Generation':'Generación', 'Rarity':'Rareza',
                        'Evolves_from':'Evoluciona de', 'Has_gender_diff':'Diferencia_género', 'Type1':'Tipo1', 'Type2':'Tipo2',
                        'HP':'Vida', 'Attack':'Ataque', 'Defense':'Defensa', 'Sp. Atk': 'Ataque esp', 'Sp. Def':'Defensa esp',
                        'Speed':'Velocidad', 'VGC2022_rules': 'Permiso VGC2022'}, inplace = True)
    pk2 = pk1[~(pk1['Nombre'].str.contains('Gigantamax'))]
    pk = pk2[~(pk2['Nombre'].str.contains('Mega'))]
    pk['Tipo2'] = pk['Tipo2'].fillna("Nada")
    pk = pk.reset_index()
    sys.stdout.write("020%\n")

    ## Información sobre los distintos movimientos, tipo de ataque, tipo de daño, presición, etc.
    url = 'https://drive.google.com/file/d/10bN4zif5RYgSEtNByuorwvWnvqWmSKgv/view?usp=sharing'
    path = 'https://drive.google.com/uc?export=download&id=' + url.split('/')[-2]
    moves = pd.read_csv(path)
    moves['Power'] = moves['Power'].fillna(0)
    moves['Cant'] = moves['Cant'].fillna(0)
    moves['Cant'] = moves['Cant'].astype(str)
    moves['Acc.'] = moves['Acc.'].fillna(100)
    sys.stdout.write("040%\n")

    ## Información sobre la naturaleza del Pokemon y como afecta las estadísticas del mismo (incrementa o decrementa cada stat en 10%)
    url = 'https://drive.google.com/file/d/1af9KS4H6NkTCMPJBvXx70j9TDk12cfk9/view?usp=sharing'
    path = 'https://drive.google.com/uc?export=download&id=' + url.split('/')[-2]
    nat = pd.read_csv(path)
    sys.stdout.write("060%\n")
    
    ## Efectividad de tipos
    url = 'https://drive.google.com/file/d/1MeRyRnwszQlp1HZegznslQash2pCAdcX/view?usp=sharing'
    path = 'https://drive.google.com/uc?export=download&id=' + url.split('/')[-2]
    eff = pd.read_csv(path)
    eff["Effectiveness"] = eff["Effectiveness"].apply(lambda x: 1 if str(x).find('Normal') != -1 else (0.5 if str(x).find('Not very') != -1 else (2 if str(x).find('Super-') != -1 else 0)))
    sys.stdout.write("080%\n")

    ## Movimientos que pueden aprender
    url = 'https://drive.google.com/file/d/1sbpvpGnUYM6p4tJcWT3qEqyWUCZyvDNs/view?usp=sharing'
    path = 'https://drive.google.com/uc?export=download&id=' + url.split('/')[-2]
    m_learn = pd.read_csv(path)
    m_learn = m_learn[['Pokemon', 'Move']]
    sys.stdout.write("100%\n")

    moves_count = m_learn['Pokemon'].value_counts()
    pk = pk[pk['Nombre'].isin(moves_count[moves_count>=4].index)].reset_index(drop=True)
    
    return pk, moves, nat, eff, m_learn

if __name__ == "__main__":
    pk, moves, nat, eff, m_learn = get_pds()
    with open('assets/dataframes.pkl', 'wb') as f:
        pickle.dump((pk, moves, nat, eff, m_learn), f)