import React, { createContext, useContext, useState } from 'react';

// Cria um contexto para compartilhar o estado da aba ativa
const TabsContext = createContext(null);

/**
 * Componente principal para o sistema de abas.
 * @param {object} props - As propriedades do componente.
 * @param {string} props.defaultValue - O valor da aba que deve estar ativa por padrão.
 * @param {React.ReactNode} props.children - Os componentes filhos (TabsList e TabsContent).
 * @param {function} [props.onValueChange] - Callback para quando o valor da aba ativa muda.
 */
export function Tabs({ defaultValue, children, onValueChange }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleSetActiveTab = (value) => {
    setActiveTab(value);
    if (onValueChange) {
      onValueChange(value);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleSetActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

/**
 * Componente para a lista de gatilhos (botões) das abas.
 * @param {object} props - As propriedades do componente.
 * @param {React.ReactNode} props.children - Os componentes filhos (TabsTrigger).
 * @param {string} [props.className] - Classes Tailwind CSS adicionais.
 */
export function TabsList({ children, className }) {
  return (
    <div className={`flex space-x-4 border-b mb-4 ${className || ''}`}>
      {children}
    </div>
  );
}

/**
 * Componente para um gatilho (botão) de aba individual.
 * @param {object} props - As propriedades do componente.
 * @param {string} props.value - O valor único que identifica esta aba.
 * @param {React.ReactNode} props.children - O conteúdo do gatilho (texto da aba).
 * @param {string} [props.className] - Classes Tailwind CSS adicionais.
 * @param {object} [props.props] - Outras propriedades HTML passadas para o botão.
 */
export function TabsTrigger({ value, children, className, ...props }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`py-2 px-4 text-lg font-medium transition-colors duration-200
        ${isActive ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}
        ${className || ''}`
      }
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Componente para o conteúdo de uma aba.
 * Renderiza seu conteúdo apenas se for a aba ativa.
 * @param {object} props - As propriedades do componente.
 * @param {string} props.value - O valor único que identifica esta aba.
 * @param {React.ReactNode} props.children - O conteúdo da aba.
 */
export function TabsContent({ value, children }) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) {
    return null;
  }
  return <div>{children}</div>;
}



