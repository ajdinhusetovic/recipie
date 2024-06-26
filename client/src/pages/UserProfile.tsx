import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ChangeEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RecipeCard from "@/components/RecipeCard";
import { Recipe } from "@/types/RecipeInterface";
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useTokenExpiration from "@/utils/useTokenExpiration.tsx";
import Loading from "@/components/Loading.tsx";

interface DecodedToken {
  username: string;
}

const UserProfile = () => {
  useTokenExpiration();

  const navigate = useNavigate();

  const { username } = useParams();

  const { toast } = useToast();

  const [usernameEdit, setUsernameEdit] = useState("");
  const [bioEdit, setBioEdit] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | undefined>(undefined);

  const url = `https://recipie-api.onrender.com/users/${username}`;

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return response.data;
    },
  });

  if (isLoading) {
    return <Loading loadingText="Loading user profile..." />;
  }

  if (error) {
    return <p>Error fetching data: {error.message}</p>;
  }

  let decodedToken: DecodedToken | null;
  let isSameUser;

  const token = localStorage.getItem("token");

  if (token) {
    decodedToken = jwtDecode(token);
    isSameUser = decodedToken && decodedToken.username === data.username;
  }

  const handleUserUpdate = async () => {
    const formData = new FormData();

    if (file) {
      formData.append("file", file);
    }
    if (usernameEdit) {
      formData.append("username", usernameEdit);
    }
    if (bioEdit) {
      formData.append("bio", bioEdit);
    }
    if (email) {
      formData.append("email", email);
    }

    try {
      const response = await axios.patch(
        `https://recipie-api.onrender.com/users/user`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const newToken = response.data.user.token;
      localStorage.removeItem("token");
      localStorage.setItem("token", newToken);
      navigate(`/users/${usernameEdit || data.username}`);
      window.location.reload();
      await refetch();
    } catch (error) {
      let errorMessages;
      if (axios.isAxiosError(error)) {
        console.log(error);
        errorMessages = error.response?.data.message;
      }

      if (Array.isArray(errorMessages)) {
        toast({
          title:
            errorMessages[0] || "There has been an error updating your account",
          variant: "fail",
        });
      } else if (typeof errorMessages === "string") {
        toast({
          title:
            errorMessages || "There has been an error creating your account",
          variant: "fail",
        });
      }
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete("https://recipie-api.onrender.com/users/user", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="w-full mt-8">
        <div className="w-11/12 lg:w-7/12 my-0 mx-auto h-full flex items-center">
          <div className="w-11/12 lg:w-full my-0 mx-auto flex flex-col items-center">
            <img
              src={data.image}
              alt=""
              className="rounded-full w-32 h-32 object-contain border-2 border-black"
            />
            <h1 className="text-4xl md:text-5xl font-medium pt-4">
              {data.username}
            </h1>
            <p className="text-lg md:text-2xl mt-5 w-11/12 mx-auto text-center">
              {data.bio}
            </p>
            {isSameUser && (
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger>
                    <Button className="mt-4">Edit profile</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit profile</DialogTitle>
                      <DialogDescription>
                        Click Save Changes to finish updating your profile.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col w-full">
                      <div className="flex flex-col">
                        <label>Username</label>
                        <input
                          type="text"
                          onChange={(e) => setUsernameEdit(e.target.value)}
                          className="border outline-none p-1 rounded"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label>Email</label>
                        <input
                          type="email"
                          onChange={(e) => setEmail(e.target.value)}
                          className="border outline-none p-1 rounded"
                        />
                      </div>
                      <div className="flex flex-col mt-4">
                        <label>
                          Bio
                          <span className="text-sm ml-1 text-gray-500">
                            (Max 200 characters)
                          </span>
                        </label>
                        <textarea
                          onChange={(e) => setBioEdit(e.target.value)}
                          className="border outline-none p-1 rounded resize-none"
                          rows={6}
                        />
                        <div className="mt-3">
                          <label>Profile picture</label>
                          <input
                            className="mt-1 block w-full text-sm text-slate-500
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
                      </div>
                    </div>
                    <Button
                      className="w-1/2 float-right"
                      onClick={handleUserUpdate}
                    >
                      Save Changes
                    </Button>
                  </DialogContent>
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger>
                    <Button variant="destructive" className="mt-4">
                      Delete profile
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your Recipi account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
            <p className="text-lg mt-8 mb-3">
              Recipes created: {data.recipes.length}
            </p>
            <div className="border w-full overflow-y-auto max-w-[640px] flex flex-col md:flex-row md:flex-wrap justify-center items-center gap-4 py-4 mb-5">
              {data.recipes.map((recipe: Recipe) => (
                <RecipeCard recipe={recipe} key={recipe.id} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
