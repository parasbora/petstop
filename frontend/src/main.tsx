
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './components/theme-provider.tsx'
import { Provider } from 'react-redux'
import { store } from './app/store.ts'
import { BrowserRouter, } from "react-router";
createRoot(document.getElementById('root')!).render(


    <Provider store={store}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
)
