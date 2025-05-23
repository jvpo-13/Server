import requests

# Configurações de autenticação
LOGIN_URL = "https://api.aloee.it/v1/Login"
API_BASE_URL = "https://api.aloee.it/v1"
EMAIL = "m250466@dac.unicamp.br"     # Credencial fornecida pela Aloee
SENHA = "Pipefa1@"         # Credencial fornecida pela Aloee

def obter_token():
    """Autentica na API e obtém o token JWT"""
    payload = {
        "email": EMAIL,
        "password": SENHA
    }

    try:
        resposta = requests.post(
            LOGIN_URL,
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        resposta.raise_for_status()
        
        # Acessa a estrutura aninhada de resposta
        dados_resposta = resposta.json()
        return dados_resposta['collection']['items'][0]['data']['token']
        
    except requests.exceptions.HTTPError as e:
        print(f"Erro HTTP: {e.response.status_code}")
        print("Detalhes:", e.response.text)
        return None
    except KeyError:
        print("Estrutura da resposta inválida - Token não encontrado")
        return None
    except Exception as e:
        print(f"Erro inesperado: {str(e)}")
        return None

def listar_produtos(token):
    """Obtém lista de produtos com paginação"""
    try:
        resposta = requests.get(
            f"{API_BASE_URL}/Product",
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/json"
            }
        )
        resposta.raise_for_status()
        return resposta.json()['collection']
    except Exception as e:
        print(f"Erro ao buscar produtos: {str(e)}")
        return None

def exibir_produtos(colecao):
    """Exibe produtos formatados com metadados de paginação"""
    if not colecao:
        return

    # Metadados de paginação
    paginacao = colecao.get('WExtra', {}).get('pagination', {})
    print(f"\n🏭 Total de Produtos: {paginacao.get('totalRecs', 'N/A')}")
    print(f"📄 Página {paginacao.get('page', 1)} de {paginacao.get('pageCount', 1)}")
    
    # Listagem de produtos
    print("\n📦 Lista de Produtos:")
    for item in colecao.get('items', []):
        dados = item.get('data', {})
        print(f"""
        ID: {dados.get('id')}
        Nome: {dados.get('name')}
        Unidade: {dados.get('unit')}
        Cor: {dados.get('color')}
        Dependências: {len(dados.get('previousProductsDependency', []))}
        Link: {API_BASE_URL}{item.get('href')}
        """)

# Execução principal
if __name__ == "__main__":
    token = obter_token()
    
    if token:
        print("🔑 Autenticação bem-sucedida!")
        colecao_produtos = listar_produtos(token)
        
        if colecao_produtos:
            exibir_produtos(colecao_produtos)
        else:
            print("❌ Nenhum produto encontrado")
    else:
        print("🔒 Falha na autenticação")