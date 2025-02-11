import express, { Request, Response } from "express";

// ==== Type Definitions, feel free to add or modify ==========================
interface cookbookEntry {
  name: string;
  type: string;
}

interface requiredItem {
  name: string;
  quantity: number;
}

interface recipe extends cookbookEntry {
  requiredItems: requiredItem[];
}

interface ingredient extends cookbookEntry {
  cookTime: number;
}

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook: any[] = [];

// Task 1 helper (don't touch)
app.post("/parse", (req:Request, res:Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input)
  if (parsed_string == null) {
    res.status(400).send("this string is cooked");
    return;
  } 
  res.json({ msg: parsed_string });
  return;
  
});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a form that 
const parse_handwriting = (recipeName: string): string | null => {

  if(recipeName.length <= 0) {
    return null;
  }

  const regex1 = new RegExp('[-_]', 'g');
  const regex2 = new RegExp('[^a-zA-Z\\s]','g');

  const newString = recipeName.replace(regex1 ," ").replace(regex2, "");
  const words = newString.split(" ")

  let finalString = ""
  for(let i = 0; i < words.length; i++) {
    if (words[i] != "") {
      const cap = words[i].slice(0,1).toUpperCase()
      const lower = words[i].slice(1).toLowerCase()
      finalString = finalString.concat(" ", cap, lower)
    } 
  }

  return finalString.trim()
}

// [TASK 2] ====================================================================
// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req:Request, res:Response) => {
  const input = req.body
  try {
    const entry = addCookbook(input)
    res.json(entry).status(200)

  } catch(error) {
    if (error instanceof Error) {
      console.log(error.message)
      if (error.message === 'Invalid Type' ||
          error.message === 'Entry already exists' ||
          error.message === 'Invalid cook time' ||
          error.message === 'Existing Required Items'
      ) {
        return res.status(400).send("this entry is cooked")
      }
    }
  }
});

const addCookbook = (entry: any): object | null => {

  if (entry.type !== "recipe" && entry.type !== "ingredient") {
    throw new Error('Invalid Type')
  } 
  
  if (cookbook.some((e) => e.name === entry.name)) {
    throw new Error('Entry already exists')
  }

  if (entry.type === "ingredient" && entry.cookTime < 0) {
    throw new Error('Invalid cook time')
  } else if (entry.type === "recipe") {
    
    let seen = new Set()
    for (const item of entry.requiredItems) {
      if (seen.has(item.name)) {
        throw new Error("Existing required items")
      }
      seen.add(item.name)
    }

  }
  cookbook.push(entry);
  return {};
};

// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req:Request, res:Response) => {
  // TODO: implement me
  const input = req.body
  try {
    const getFood = getInfo(input)
    return res.status(200).json(getFood)

  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).send("Cooked")
    }
  }

});

const getInfo = (entry) => {
  const check = cookbook.indexOf((e) => e.name === entry.name)
  if (check === -1) {
    throw new Error ('Entry does not exist in cookbook')
  }

  const found = cookbook[check].name
  for (const item of found.requiredItems) {
    console.log(item.name)
  }

  return {
    // "name" : found.name,
    // "cookTime" : 10,
    // "ingredients" : [
    //   {
    //     "name": "Beef",
    //     "quantity" : 5,
    //   }
    // ]
  }

}

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
