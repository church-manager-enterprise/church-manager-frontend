# 🚀 Acesso Rápido ao Dashboard

## O que foi implementado?

O botão "@ Entrar" na página inicial (`Home`) agora faz **login automático** e redireciona diretamente para o **Dashboard** (área protegida).

## Como funciona?

### 1. **Botão "Entrar" na Home**
Quando o usuário clica em "@ Entrar":
- Um login automático é simulado com credenciais padrão
- O token JWT é salvo no localStorage
- O usuário é redirecionado para `/dashboard`

### 2. **Proteção de Rota**
O Dashboard está protegido pelo `authGuard`:
- Se o usuário **não estiver autenticado**, é redirecionado para `/login`
- Se o usuário **estiver autenticado**, acessa o dashboard normalmente

## Testando

### Passo 1: Acesse a Home
```
http://localhost:4200
```

### Passo 2: Clique em "@ Entrar"
O sistema irá:
1. ✅ Fazer login automático
2. ✅ Salvar o token
3. ✅ Redirecionar para o Dashboard

### Passo 3: Veja seus Eventos
No Dashboard você verá:
- ✅ 6 eventos simulados
- ✅ Informações de cada evento (data, local, participantes)
- ✅ Status (confirmado, pendente, cancelado)
- ✅ Estatísticas de participação

## Estrutura de Arquivos Modificados

```
src/app/components/home/
├── home.ts          ✏️ Adicionado método onEntrar()
└── home.html        ✏️ Botão chama onEntrar() via (click)
```

## Código Implementado

### home.ts
```typescript
onEntrar(): void {
  // Faz login automático simulado
  this.authService.login('usuario@church.com', '123456').subscribe({
    next: () => {
      // Redireciona para o dashboard
      this.router.navigate(['/dashboard']);
    },
    error: (error) => {
      console.error('Erro ao fazer login:', error);
    }
  });
}
```

### home.html
```html
<a (click)="onEntrar()" class="login-link" style="cursor: pointer;">@ Entrar</a>
```

## Fluxo de Autenticação

```
┌─────────────┐
│    Home     │
└─────┬───────┘
      │ Click "@ Entrar"
      ▼
┌─────────────────┐
│  AuthService    │
│  login()        │ → Salva token no localStorage
└─────┬───────────┘
      │ Login bem-sucedido
      ▼
┌─────────────────┐
│   AuthGuard     │
│  verifica token │ → ✅ Token válido
└─────┬───────────┘
      │ Permite acesso
      ▼
┌─────────────────┐
│   Dashboard     │ → Mostra eventos
└─────────────────┘
```

## Logout

No Dashboard, há um botão "Sair" que:
1. Remove o token do localStorage
2. Redireciona para `/login`

## Rotas Disponíveis

| Rota | Protegida? | Descrição |
|------|-----------|-----------|
| `/` | ❌ Não | Página inicial (Landing Page) |
| `/login` | ❌ Não | Página de login (formulário) |
| `/dashboard` | ✅ Sim | Dashboard com eventos do usuário |

## Próximos Passos

1. **Remover login automático** quando o backend estiver pronto
2. **Usar dados reais** do usuário logado
3. **Adicionar mais páginas protegidas** (perfil, configurações, etc.)
4. **Implementar refresh token** para manter usuário logado

## Observações

- 🔒 O Dashboard só é acessível com token válido
- 🎭 Por enquanto, o login é simulado (não conecta ao backend)
- 💾 O token é salvo no localStorage
- 🔄 Ao fazer logout, o token é removido

---

**Tudo pronto!** Execute `npm start` e clique em "@ Entrar" para acessar o Dashboard! 🎉
