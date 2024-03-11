import Navbar from "@/components/Navbar";
import { useToast } from "@/components/ui/use-toast";
import { RecipeStep } from "@/types/StepInterface";
import axios from "axios";
import { ChangeEvent, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";

interface CreateRecipeProps {
  mode: "create" | "edit";
}

const CreateRecipe: React.FC<CreateRecipeProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { slug } = useParams();

  const [cookie] = useCookies();

  const [recipeName, setRecipeName] = useState("");
  const [recipeDescription, setRecipeDescription] = useState("");

  const [prepTime, setPrepTime] = useState(0);
  const [cookTime, setCookTime] = useState(0);

  const [recipeDifficulty, setRecipeDifficulty] = useState("easy");

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredient, setIngredient] = useState("");

  const [instruction, setInstruction] = useState("");
  const [instructions, setInstructions] = useState<string[]>([]);

  const [tag, setTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [file, setFile] = useState<File | undefined>(undefined);

  const [fetchedSlug, setFetchedSlug] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://recipie-api.onrender.com/recipes/${slug}`,
          {
            headers: {
              Authorization: `Bearer ${cookie.token}`,
            },
          }
        );

        const { data } = response;

        console.log("FETCHED RECIPE FROM SLUG:", data);

        setFetchedSlug(data.slug);
        setRecipeName(data.name);
        setRecipeDescription(data.description);
        setPrepTime(data.prepTime);
        setCookTime(data.cookTime);
        setRecipeDifficulty(data.difficulty);
        setIngredients(data.ingredients);
        setInstructions(data.steps.map((step: RecipeStep) => step.instruction));
        setTags(data.tags);
      } catch (error) {
        console.error("Error fetching recipe data", error);
      }
    };

    if (mode === "edit" && slug) {
      fetchData();
    }
  }, [mode, slug, cookie.token]);

  const handleIngredientInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIngredient(e.target.value);
  };

  const addIngredient = () => {
    if (ingredient.length <= 0) {
      toast({ title: "No ingredient", variant: "fail" });
      return;
    }
    setIngredients([...ingredients, ingredient]);
    setIngredient("");
  };

  const addInstruction = () => {
    if (instruction.length <= 0) {
      toast({ title: "No instruction", variant: "fail" });
      return;
    }
    setInstructions([...instructions, instruction]);
    setInstruction("");
  };

  const removeLastInstruction = () => {
    const updatedInstructions = [...instructions];
    updatedInstructions.pop();
    setInstructions(updatedInstructions);
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients.splice(index, 1);
    setIngredients(updatedIngredients);
  };

  const addTag = () => {
    const trimmedTag = tag.trim();

    if (tags.length < 3 && trimmedTag !== "" && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTag("");
    } else if (tags.includes(trimmedTag)) {
      toast({
        title: "Tag already exists",
        variant: "fail",
      });
    } else if (trimmedTag === "") {
      toast({
        title: "Tag cannot be empty",
        variant: "fail",
      });
    } else {
      toast({
        title: "Maximum of 3 tags",
        variant: "fail",
      });
    }
  };

  const deleteTag = (index: number) => {
    const updatedTags = [...tags];
    if (updatedTags.length === 1) {
      toast({ title: "Recipe must have at least one tag", variant: "fail" });
      return;
    }
    updatedTags.splice(index, 1);
    setTags(updatedTags);
  };

  console.log("INGREDIENTS:", ingredients);
  console.log("STEPS:", instructions);

  const submitRecipe = async () => {
    console.log("Before submission - fetchedSlug:", fetchedSlug);

    if (mode === "create") {
      if (
        !recipeName.trim() ||
        !recipeDescription.trim() ||
        prepTime === 0 ||
        !recipeDifficulty.trim() ||
        ingredients.length === 0 ||
        instructions.length === 0 ||
        tags.length === 0
      ) {
        toast({
          title: "Please fill in all fields",
          variant: "fail",
        });
        return;
      }
    }

    const formData = new FormData();

    formData.append("file", file || "");
    formData.append("name", recipeName);
    formData.append("description", recipeDescription);
    formData.append("prepTime", prepTime.toString());
    formData.append("cookTime", cookTime.toString());
    formData.append("difficulty", recipeDifficulty);
    formData.append("instructions[]", "osman");
    ingredients.forEach((ingredient, index) => {
      formData.append(`ingredients[${index}]`, ingredient);
    });
    instructions.forEach((instruction, index) => {
      formData.append(`steps[${index}]`, instruction);
    });
    tags.forEach((tag, index) => {
      formData.append(`tags[${index}]`, tag);
    });

    console.log("Form data:", formData);

    try {
      setLoading(true);
      let response;
      if (mode === "create") {
        response = await axios.post(
          "https://recipie-api.onrender.com/recipes",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${cookie.token}`,
            },
          }
        );
      } else if (mode === "edit") {
        response = await axios.put(
          `https://recipie-api.onrender.com/recipes/${slug}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${cookie.token}`,
            },
          }
        );
      }
      console.log("Recipe submitted successfully", response?.data);
    } catch (error) {
      console.error("Error submitting recipe", error);
      console.log("After submission - fetchedSlug:", fetchedSlug);
    } finally {
      setLoading(false);
      navigate("/");
    }
  };

  return (
    <>
      <Navbar />
      <p className="flex text-lg flex-wrap w-11/12 mx-auto mt-4">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="bg-violet-50 ml-2 p-[6px] rounded text-center inline-block cursor-pointer text-violet-500"
            onClick={() => deleteTag(index)}
          >
            {tag}
          </span>
        ))}
      </p>
      <div className="flex flex-col mt-5 w-11/12 mx-auto md:flex-row md:gap-10 max-w-[400px] md:max-w-full">
        <div className="flex flex-col gap-5 md:w-1/2 md:gap-8">
          <div className="flex flex-col">
            <label className="text-lg">Recipe name</label>
            <input
              type="text"
              className="border rounded p-1 md:p-2"
              onChange={(e) => setRecipeName(e.target.value)}
              value={recipeName}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-lg">Description</label>
            <textarea
              className="border resize-none h-[150px] p-1"
              onChange={(e) => setRecipeDescription(e.target.value)}
              value={recipeDescription}
            ></textarea>
          </div>
          <div className="flex gap-2">
            <label className="text-lg">Prep Time</label>
            <input
              type="number"
              className="border rounded w-1/2 p-1 md:p-2"
              onChange={(e) => setPrepTime(parseInt(e.target.value))}
              value={prepTime}
              min="0"
            />
          </div>
          <div className="flex gap-2">
            <label className="text-lg">Cook time</label>
            <input
              type="number"
              className="border rounded w-1/2 p-1 md:p-2"
              onChange={(e) => setCookTime(parseInt(e.target.value))}
              value={cookTime}
              min="0"
            />
          </div>
          <div className="flex gap-2">
            <label className="text-lg">Recipe difficulty</label>
            <select
              name="recipeDifficulty"
              onChange={(e) => setRecipeDifficulty(e.target.value)}
              className="p-1 rounded text-violet-700 bg-violet-50 font-medium md:p-2"
              value={recipeDifficulty}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-5 mt-5 md:w-1/2 md:mt-0 md:gap-8">
          <div className="flex flex-col">
            <div className="md:flex md:flex-col">
              <label className="text-lg">Ingredients</label>
              <div>
                <input
                  type="text"
                  className="border rounded p-1 md:p-2 w-1/2"
                  value={ingredient}
                  onChange={(e) => handleIngredientInput(e)}
                />
                <button
                  className="bg-violet-50 ml-4 p-1 rounded w-[50px] inline"
                  onClick={addIngredient}
                >
                  Add
                </button>
              </div>
            </div>
            <div className={ingredients.length <= 0 ? "hidden" : ""}>
              <ul>
                {ingredients.map((ingredient, index) => (
                  <li
                    key={index}
                    onClick={() => removeIngredient(index)}
                    className="list-disc ml-8 mt-4 flex items-center bg-violet-50 hover:bg-violet-100 w-fit p-2 rounded text-violet-500 cursor-pointer"
                  >
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-col">
              <label className="text-lg">Instructions</label>
              <textarea
                name=""
                onChange={(e) => setInstruction(e.target.value)}
                value={instruction}
                className="border p-1 resize-none h-[200px]"
              ></textarea>
              <div className="flex gap-2">
                <button
                  className="bg-violet-50 mt-2 p-1 rounded w-[50px]"
                  onClick={addInstruction}
                >
                  Add
                </button>
                <button
                  className="bg-violet-50 mt-2 p-1 rounded w-[50px]"
                  onClick={removeLastInstruction}
                >
                  Undo
                </button>
              </div>
            </div>
            {instructions.length > 0 && (
              <div className="border rounded mt-2 p-1 h-[300px] overflow-auto">
                {instructions.length > 0 &&
                  instructions.map((inst, index) => (
                    <div key={index} className="p-1">
                      <h1 className="font-medium text-lg">Step: {index + 1}</h1>
                      <p className="text-md">{inst}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <div>
            <div className="flex gap-2 items-center">
              <label>Tags</label>
              <input
                type="text"
                className="border rounded w-1/2 p-1"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
              <button
                className="bg-violet-50 p-1 rounded w-[50px]"
                onClick={addTag}
              >
                Add
              </button>
            </div>
          </div>
          <div>
            <input
              className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-violet-50 file:text-violet-700
                        hover:file:bg-violet-100"
              type="file"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                e.target.files && setFile(e.target.files[0])
              }
            />
          </div>
          <button
            className="mt-1 mb-4 rounded bg-violet-500 hover:bg-violet-600 text-violet-50 font-medium w-[150px] mx-auto p-1 text-md"
            onClick={submitRecipe}
          >
            Create recipe
          </button>
        </div>
        {loading && (
          <div className="fixed top-0 left-0 w-screen h-screen flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
            <svg
              className="animate-spin "
              fill="none"
              height="48"
              viewBox="0 0 48 48"
              width="48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 24C4 35.0457 12.9543 44 24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4"
                stroke="violet"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="4"
              />
            </svg>
            <h1 className="text-violet-50 mt-2">Submitting recipe...</h1>
          </div>
        )}
      </div>
    </>
  );
};

export default CreateRecipe;
