const openAiApiKey = process.env.openAiApiKey;


const OpenAI = require("openai").default;
const openai = new OpenAI({ apiKey: openAiApiKey });

const {RecursiveCharacterTextSplitter} = require("langchain/text_splitter");

async function queryOpenAi(question) {
    const systemPrompt = "Answer the question from the user ### "
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
    
    return {
        statusCode: 200,
        body: JSON.stringify({ reply: response.message.content }),
        headers: { 'Content-Type': 'application/json' },
    };
};
