const openAiApiKey = process.env.openAiApiKey;
const fs = require('fs');

const OpenAI = require("openai").default;
const openai = new OpenAI({ apiKey: openAiApiKey });

const {RecursiveCharacterTextSplitter} = require("langchain/text_splitter");

var memory = process.env.MEMORY

async function queryOpenAi(question) {
    var systemPrompt = `You have two skills. 
    1. You can either store the fact in the memory.
    2. You can answer the question from the user.

    If the user ask you the question, answer the question using your memory and all your knowledge. Using JSON format {question:answer to the question}
    If the user tell you the fact return JSON {memory:the fact that user told you}

    You can answer with the JSON and nothing more.

    ###
    Exampes:
    User: What is the capital of Poland?
    You: {"question": "Warsaw"}

    User: I'm living in Berlin
    You: {"memory": "User is living in Berlin"}

    ###
    Your memory:
    ` + memory + "\n\n####"

    console.log(systemPrompt)

    const completion = await openai.chat.completions.create({
    messages: [
        { role: "system", content: systemPrompt }, 
        { role: "user", content: question }
    ],
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0];
}

exports.handler = async function(event, context) {

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
            headers: { 'Content-Type': 'application/json' },
        };
    }

    const body = JSON.parse(event.body);
    console.log(body);

    if (!body.hasOwnProperty('question')) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing 'question' in request body" }),
            headers: { 'Content-Type': 'application/json' },
        };
    }


    console.log(body['question'])

    const response = await queryOpenAi(body['question'])

    console.log(response.message.content)
    var responseBody = JSON.parse(response.message.content)
    if(responseBody.hasOwnProperty('memory')) {
        console.log(memory)
        memory += responseBody['memory'] + "\n"
        console.log("Adding to the memory")
        process.env.MEMORY = memory
        console.log(memory)
        
    }
    
    return {
        statusCode: 200,
        body: JSON.stringify({ reply: response.message.content }),
        headers: { 'Content-Type': 'application/json' },
    };
};
