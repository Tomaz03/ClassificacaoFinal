// Serviço de autenticação
class AuthService {
  constructor() {
    this.baseURL = 'http://localhost:8000' // URL do backend FastAPI
    this.token = localStorage.getItem('token')
  }

  // Configurar token de autenticação
  setToken(token) {
    this.token = token
    localStorage.setItem('token', token)
  }

  // Remover token
  removeToken() {
    this.token = null
    localStorage.removeItem('token')
  }

  // Obter headers com autenticação
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    }
  }

  // Fazer login com email e senha
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Erro ao fazer login')
      }

      const data = await response.json()
      this.setToken(data.access_token)
      return data
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  // Fazer cadastro
  async register(name, email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ name, email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Erro ao criar conta')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Erro no cadastro:', error)
      throw error
    }
  }

  // Obter dados do usuário atual
  async getCurrentUser() {
    try {
      if (!this.token) {
        throw new Error('Token não encontrado')
      }

      const response = await fetch(`${this.baseURL}/auth/me`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Erro ao obter dados do usuário')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao obter usuário:', error)
      this.removeToken()
      throw error
    }
  }

  // Fazer logout
  logout() {
    this.removeToken()
    window.location.href = '/'
  }

  // Verificar se está logado
  isAuthenticated() {
    return !!this.token
  }

  // Login com Google
  async loginWithGoogle() {
    try {
      // Abrir popup para autenticação Google
      const popup = window.open(
        `${this.baseURL}/auth/google`,
        'google-login',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )

      return new Promise((resolve, reject) => {
        // Escutar mensagens do popup
        const messageListener = (event) => {
          if (event.origin !== this.baseURL.replace(':8000', ':5173')) {
            return
          }

          if (event.data.status === 'success') {
            this.setToken(event.data.access_token)
            window.removeEventListener('message', messageListener)
            popup.close()
            resolve(event.data)
          } else if (event.data.status === 'error') {
            window.removeEventListener('message', messageListener)
            popup.close()
            reject(new Error(event.data.message || 'Erro na autenticação com Google'))
          }
        }

        window.addEventListener('message', messageListener)

        // Verificar se o popup foi fechado manualmente
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            window.removeEventListener('message', messageListener)
            reject(new Error('Login cancelado pelo usuário'))
          }
        }, 1000)
      })
    } catch (error) {
      console.error('Erro no login com Google:', error)
      throw error
    }
  }
}

// Exportar instância única
const authService = new AuthService()
export default authService



