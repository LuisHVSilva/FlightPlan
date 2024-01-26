import pandas as pd
import json

nome_arquivo_excel = "world-airports"


# Ler o arquivo Excel
caminho_arquivo_excel = f'./data/{nome_arquivo_excel}.xlsx'
dados_excel = pd.read_excel(caminho_arquivo_excel)

# Converter para JSON
dados_json = dados_excel.to_json(orient='records')

# Carregar o JSON como um objeto Python (opcional)
objeto_json = json.loads(dados_json)

# Salvar o JSON em um novo arquivo
caminho_novo_json = f'./json/{nome_arquivo_excel}.json'
with open(caminho_novo_json, 'w') as arquivo_json:
    json.dump(objeto_json, arquivo_json, indent=2)

print(f'O arquivo JSON foi salvo em: {caminho_novo_json}')
