import dotenv from 'dotenv';
dotenv.config();
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { runSummaryAgent } from './summary_agent'; // Import the runSummaryAgent function

// Define the tools for the agent to use
const agentTools = [new TavilySearchResults({ maxResults: 3 })];
const agentModel = new ChatOpenAI({ temperature: 0 });

// Initialize memory to persist state between graph runs
const agentCheckpointer = new MemorySaver();
const agent = createReactAgent({
  llm: agentModel,
  tools: agentTools,
  checkpointSaver: agentCheckpointer,
});

// Function to invoke agent actions
async function runScoreAgent(rubric, essay) {
  // Get the summary from the summary agent
  const summary = await runSummaryAgent(rubric, essay);

  // Process the summary
  const agentFinalState = await agent.invoke(
    { messages: [new HumanMessage(`Based on this summary, provide a score for the essay according to the rubric. The score should be on a 0 - 100 scale. Your response should only be the numerical score and contain no other word or an explaination. Summary: ${summary}`)] },
    { configurable: { thread_id: "42" } }
  );

  const lastMessage = agentFinalState.messages[agentFinalState.messages.length - 1].content;
  console.log(lastMessage);
  return lastMessage;
}

// Example usage
const RUBRIC = `Essay Grading Rubric
Thesis and Argument (20 Points)
- Clear and concise thesis statement that defines the purpose of the essay.
- Logical progression of arguments that support the thesis throughout the essay.
Organization and Structure (15 Points)
- Well-structured introduction, body paragraphs, and conclusion.
- Smooth transitions between paragraphs and ideas.
Evidence and Support (20 Points)
- Uses relevant, credible, and sufficient evidence to support arguments.
- Proper citation of sources where necessary.
Critical Thinking and Analysis (15 Points)
- Demonstrates deep understanding and critical analysis of the topic.
- Considers multiple perspectives where applicable.
Grammar, Mechanics, and Style (15 Points)
- Free of grammatical, spelling, and punctuation errors.
- Appropriate academic tone and style.
Originality and Creativity (15 Points)
- Presents original ideas or unique perspectives.
- Engages the reader with creative insights.`;

const ESSAY = `Climate Change and Its Global Impact
Climate change represents one of the most significant challenges facing humanity today. It refers to
long-term shifts in temperatures and weather patterns, primarily caused by human activities, such as
burning fossil fuels, deforestation, and industrial processes. These activities increase the
concentration of greenhouse gases in the atmosphere, leading to global warming.
The impacts of climate change are far-reaching and affect every aspect of our environment and daily
lives. Rising temperatures contribute to the melting of polar ice caps and glaciers, leading to rising
sea levels. Coastal regions are particularly vulnerable, facing the risk of flooding, erosion, and loss
of habitats. This not only threatens wildlife but also endangers human communities living in these
areas.
Another significant effect of climate change is the increased frequency and severity of extreme
weather events. Hurricanes, droughts, wildfires, and heatwaves are becoming more common and
intense. These disasters result in loss of life, destruction of property, and displacement of
communities. They also strain emergency response systems and put immense pressure on
resources and infrastructure.
Climate change also has profound effects on ecosystems and biodiversity. Many species struggle to
adapt to rapidly changing conditions, leading to shifts in populations, migration patterns, and even
extinction. Coral reefs, for example, are highly sensitive to temperature changes, and coral
bleaching events have become more frequent, threatening the rich biodiversity they support.
The economic consequences of climate change are substantial. Agricultural productivity is affected
by altered weather patterns, leading to food insecurity in many parts of the world. Water resources
are becoming scarcer in some regions, affecting both drinking water supplies and irrigation for
crops. Additionally, the health impacts of climate change, such as the spread of diseases and
heat-related illnesses, place additional burdens on healthcare systems.
Addressing climate change requires a concerted global effort. Reducing greenhouse gas emissions
is critical, and this can be achieved through a combination of transitioning to renewable energy
sources, improving energy efficiency, and adopting sustainable agricultural and industrial practices.
Governments, businesses, and individuals all have roles to play in mitigating climate change and
adapting to its impacts.
International agreements, such as the Paris Agreement, aim to unite countries in the fight against
climate change by setting targets for emission reductions and promoting sustainable development.
However, achieving these goals requires political will, financial investment, and technological
innovation. Public awareness and education are also vital in fostering a culture of environmental
responsibility and encouraging sustainable behaviors.
In conclusion, climate change poses a grave threat to the planet and its inhabitants. While the
challenges are immense, the opportunities for positive change are equally significant. By taking
decisive action now, we can mitigate the worst effects of climate change, protect our environment,
and ensure a sustainable future for generations to come.`;

// Execute the function
runScoreAgent(RUBRIC, ESSAY).then(score => console.log(score));