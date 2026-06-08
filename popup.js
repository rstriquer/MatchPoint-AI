// Função auxiliar para buscar o estado atual e salvar
async function updatePerfil(novosDados) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['perfil'], (result) => {
      const perfilAtual = result.perfil || {};
      const perfilAtualizado = { ...perfilAtual, ...novosDados };
      chrome.storage.local.set({ perfil: perfilAtualizado }, resolve);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['perfil'], (result) => {
    if (result.perfil) {
      const p = result.perfil;
      document.getElementById('curriculo').value = p.curriculo || '';
      document.getElementById('regras').value = p.regras || '';
      document.getElementById('geminiKey').value = p.geminiKey || '';
      document.getElementById('openaiKey').value = p.openaiKey || '';
      
      if (p.selectedGeminiModel) document.getElementById('geminiModelSelect').value = p.selectedGeminiModel;
      if (p.selectedOpenAIModel) document.getElementById('openaiModelSelect').value = p.selectedOpenAIModel;
    }
  });
});


document.getElementById('salvar').addEventListener('click', async () => {
  await updatePerfil({
    curriculo: document.getElementById('curriculo').value,
    regras: document.getElementById('regras').value,
    geminiKey: document.getElementById('geminiKey').value,
    openaiKey: document.getElementById('openaiKey').value,
    selectedGeminiModel: document.getElementById('geminiModelSelect').value,
    selectedOpenAIModel: document.getElementById('openaiModelSelect').value
  });
  alert("Context and settings saved!");
});

function filtrarModelosOpenAI(models) {
  return models
    .filter(modelId => {
      // 1. Remove modelos específicos de data/snapshots (ex: -0301, -0613, -1106)
      // 2. Remove modelos 'shared' ou de teste
      const isSnapshot = /\d{4}/.test(modelId); // Regex para detectar datas (ex: 0301)
      const isShared = modelId.includes('-shared');
      
      // Mantém apenas modelos "limpos" e relevantes
      // Você pode ajustar esta lógica para incluir apenas o que desejar
      return !isSnapshot && !isShared && (
        modelId.startsWith('gpt-4') || 
        modelId.startsWith('gpt-3.5') || 
        modelId.startsWith('o1') || 
        modelId.startsWith('o3')
      );
    })
    .sort();
}

function filtrarModelosGemini(models) {
  // Lista de padrões que queremos manter
  const permitidos = ['gemini-1.5', 'gemini-2.0', 'gemini-pro', 'gemini-flash'];

  return models
    .filter(modelName => {
      // O Google retorna nomes como "models/gemini-1.5-flash"
      const nome = modelName.replace('models/', '');
      
      // Filtra: deve ser um modelo de chat e não ser 'embedding' ou 'aqa'
      const isChatModel = permitidos.some(p => nome.includes(p));
      const isNotEmbedding = !nome.includes('embedding');
      const isNotAqa = !nome.includes('aqa'); // AQA são modelos de teste para QA

      return isChatModel && isNotEmbedding && isNotAqa;
    })
    .sort();
}

async function getPageText() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => document.body.innerText
  });
  return result;
}

function getPrompt(perfil, textoPagina) {
  return `RULES: ${perfil.regras}
  
  CANDIDATE RESUME: 
  ${perfil.curriculo}

  INSTRUCTIONS:
  You are an expert technical recruiter and architect. You must perform a DEEP analysis of the RESUME provided above. 
  
  CRITICAL: Do not assume the candidate lacks experience based on the summary alone. SCAN the entire "Technical Skills Matrix" and "Employment History" sections of the resume to verify technical stacks. 
  
  ANALYSIS:
  1. Is it a job or a scam? Reply only "Job" or "Scam".
  2. Relationship to my goals: Reply "High", "Medium", or "Low". Add a 1-line justification explicitly citing WHERE in the resume the experience was found (e.g., "Found PHP/PostgreSQL experience in Technical Skills Matrix and Employment History").
  3. Probability of being hired: If there are technical constraints (e.g., location, citizenship), reply "Impossible" and point out the specific restriction. Otherwise, estimate probability.

  JOB POSTING CONTENT: 
  ${textoPagina}`;
}

// Handler Gemini CORRIGIDO
document.getElementById('analisarGemini').addEventListener('click', async () => {
  const divResultado = document.getElementById('resultado');
	const model = document.getElementById('geminiModelSelect').value.replace('models/', '');
  if (!model) return alert("Please select a Gemini model first!");

  const { perfil } = await chrome.storage.local.get('perfil');
  const textoPagina = await getPageText();
  divResultado.innerText = "Analyzing with Gemini...";

  try {
		const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${perfil.geminiKey}`;
		
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ 
				contents: [{ parts: [{ text: getPrompt(perfil, textoPagina) }] }] 
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`API Error (${response.status}): ${errorText}`);
		}

		// 2. Só tenta ler o JSON se o status for OK
		const data = await response.json();
		
		if (data.error) {
			throw new Error(data.error.message);
		}

		divResultado.innerText = data.candidates[0].content.parts[0].text;
	} catch (e) { 
		divResultado.innerText = "Error: " + e.message; 
		console.error(e);
	}
});

// Handler OpenAI
document.getElementById('analisarOpenAI').addEventListener('click', async () => {
  const divResultado = document.getElementById('resultado');
  const model = document.getElementById('openaiModelSelect').value;
  if (!model) return alert("Please select an OpenAI model first!");

  const { perfil } = await chrome.storage.local.get('perfil');
  const textoPagina = await getPageText();
  divResultado.innerText = "Analyzing with OpenAI...";

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${perfil.openaiKey}` },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: getPrompt(perfil, textoPagina) }]
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    divResultado.innerText = data.choices[0].message.content;
  } catch (e) { divResultado.innerText = "Error: " + e.message; }
});
