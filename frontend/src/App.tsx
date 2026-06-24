import { useState, useEffect, type FormEvent } from 'react';
import ChatLayout from './components/ChatLayout';

export interface Message {
  id: number;
  content: string;
  sender: 'user' | 'bot';
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  showFeedbackButtons: boolean;
  showFollowUpOptions: boolean;
  isWaitingForTicketDescription: boolean;
}

// Mensaje inicial mejorado
const initialMessage: Message = {
  id: 0,
  content: "Hola, soy EPIS Pilot, el asistente virtual de EPIS Corp. ¿En qué puedo ayudarte hoy?",
  sender: 'bot',
};

const LOCAL_STORAGE_KEY = 'epis_chat_sessions';

function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Cargar desde localStorage al montar el componente
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatSession[];
        if (parsed.length > 0) {
          setSessions(parsed);
          setCurrentSessionId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error("Error al cargar el historial de chats:", e);
      }
    }
    
    // Crear una sesión inicial predeterminada
    const defaultSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Nueva Conversación',
      messages: [initialMessage],
      showFeedbackButtons: false,
      showFollowUpOptions: false,
      isWaitingForTicketDescription: false,
    };
    setSessions([defaultSession]);
    setCurrentSessionId(defaultSession.id);
  }, []);

  // Guardar sesiones en localStorage
  const saveSessions = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSessions));
  };

  // Obtener sesión activa
  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  const updateCurrentSession = (updates: Partial<ChatSession>) => {
    if (!currentSessionId) return;
    const updated = sessions.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, ...updates };
      }
      return s;
    });
    saveSessions(updated);
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    setInput('');
  };

  const handleCreateSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Nueva Conversación',
      messages: [initialMessage],
      showFeedbackButtons: false,
      showFollowUpOptions: false,
      isWaitingForTicketDescription: false,
    };
    const updated = [newSession, ...sessions];
    saveSessions(updated);
    setCurrentSessionId(newSession.id);
    setInput('');
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar seleccionar la conversación al intentar borrarla
    const updated = sessions.filter(s => s.id !== id);
    
    if (updated.length === 0) {
      const defaultSession: ChatSession = {
        id: Date.now().toString(),
        title: 'Nueva Conversación',
        messages: [initialMessage],
        showFeedbackButtons: false,
        showFollowUpOptions: false,
        isWaitingForTicketDescription: false,
      };
      saveSessions([defaultSession]);
      setCurrentSessionId(defaultSession.id);
    } else {
      saveSessions(updated);
      if (currentSessionId === id) {
        setCurrentSessionId(updated[0].id);
      }
    }
  };

  const sendMessage = async (messageToSend: string, isInternalAction = false) => {
    if (!currentSession) return;

    const isWaiting = currentSession.isWaitingForTicketDescription;
    let finalMessage = messageToSend;
    let nextWaiting = isWaiting;

    if (isWaiting && !isInternalAction) {
      finalMessage = `ACTION_CREATE_TICKET:${messageToSend}`;
      nextWaiting = false;
      isInternalAction = true;
    }

    const updatedMessages = [...currentSession.messages];
    let newTitle = currentSession.title;

    if (!isInternalAction) {
      const userMessage: Message = { id: Date.now(), sender: 'user', content: messageToSend };
      updatedMessages.push(userMessage);
      
      // Actualizar el título de la sesión con la primera pregunta
      if (currentSession.title === 'Nueva Conversación' && currentSession.messages.length <= 1) {
        newTitle = messageToSend.length > 25 ? messageToSend.substring(0, 25) + '...' : messageToSend;
      }
    }

    const tempSessions = sessions.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          messages: updatedMessages,
          title: newTitle,
          showFeedbackButtons: false,
          showFollowUpOptions: false,
          isWaitingForTicketDescription: nextWaiting,
        };
      }
      return s;
    });
    saveSessions(tempSessions);
    setIsLoading(true);
    setInput('');

    try {
      const response = await fetch(`/api/ask?question=${encodeURIComponent(finalMessage)}`);
      if (!response.ok) throw new Error('Error en la respuesta de la red');

      const data = await response.json();
      const botMessage: Message = { id: Date.now() + 1, sender: 'bot', content: data.answer };
      
      const finalSessions = tempSessions.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...updatedMessages, botMessage],
            showFeedbackButtons: !!data.follow_up_required,
          };
        }
        return s;
      });
      saveSessions(finalSessions);
    } catch (error) {
      console.error("Error al contactar la API:", error);
      const errorMessage: Message = { id: Date.now() + 1, sender: 'bot', content: "Error: No se pudo obtener respuesta del servidor." };
      const finalSessions = tempSessions.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...updatedMessages, errorMessage],
          };
        }
        return s;
      });
      saveSessions(finalSessions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
  };

  const handleFeedback = (response: 'yes' | 'no') => {
    if (!currentSession) return;
    
    if (response === 'yes') {
      const confirmationMessage: Message = { id: Date.now(), sender: 'bot', content: "¡Genial! Me alegro de haberte ayudado. Si necesitas algo más, no dudes en preguntar." };
      updateCurrentSession({
        messages: [...currentSession.messages, confirmationMessage],
        showFeedbackButtons: false,
      });
    } else {
      const followUpMessage: Message = { id: Date.now(), sender: 'bot', content: "Entendido. ¿Cómo quieres proceder?" };
      updateCurrentSession({
        messages: [...currentSession.messages, followUpMessage],
        showFeedbackButtons: false,
        showFollowUpOptions: true,
      });
    }
  };

  const handleFollowUpChoice = (choice: 'create_ticket' | 'explain_more') => {
    if (!currentSession) return;

    if (choice === 'create_ticket') {
      const askForDescriptionMessage: Message = { id: Date.now(), sender: 'bot', content: "De acuerdo. Por favor, explique su problema con detalle para que un experto le atienda. Lo que escriba a continuación se registrará en el ticket." };
      updateCurrentSession({
        messages: [...currentSession.messages, askForDescriptionMessage],
        showFollowUpOptions: false,
        isWaitingForTicketDescription: true,
      });
    } else {
      const explainMoreMessage: Message = { id: Date.now(), sender: 'bot', content: "Por favor, describe tu problema con más detalle en el chat." };
      updateCurrentSession({
        messages: [...currentSession.messages, explainMoreMessage],
        showFollowUpOptions: false,
      });
    }
  };

  if (sessions.length === 0 || !currentSession) {
    return null;
  }

  return (
    <ChatLayout
      sessions={sessions}
      currentSessionId={currentSessionId}
      onSelectSession={handleSelectSession}
      onCreateSession={handleCreateSession}
      onDeleteSession={handleDeleteSession}
      messages={currentSession.messages}
      input={input}
      setInput={setInput}
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      showFeedbackButtons={currentSession.showFeedbackButtons}
      onFeedback={handleFeedback}
      showFollowUpOptions={currentSession.showFollowUpOptions}
      onFollowUpChoice={handleFollowUpChoice}
    />
  );
}

export default App;