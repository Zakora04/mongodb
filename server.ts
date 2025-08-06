import express, { Application, Request, Response } from "express";
import { ReadStream } from "fs";
import mongoose, { model, Schema } from "mongoose";

const app: Application = express();

mongoose
  .connect("mongodb://localhost:27017/internsD")
  .then(() => {
    console.log(" Working DB");
  })
  .catch((err: any) => {
    console.log("An error occured", err.message);
  });
interface User {
  name: string;
  email: string;
  password: string;
}
const userSchema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const User = model<User>("MyUsers", userSchema);

app.get("/users", async (req: Request<User>, res: Response) => {
  try {
    const getallusers = await User.find();
    res
      .status(200)
      .json({ message: "All users gotten successfully", data: getallusers });
  } catch (err: any) {
    res.status(500).json({ message: "An error occured", err: err.message });
  }
});

app.get("/get-one/:id", async (req: Request, res: Response) => {
  try {
    // const {id} = req.params
    const getAuser = await User.findById(req.params.id);
    if (!getAuser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User gotten", data: getAuser });
  } catch (err: any) {
    res.status(500).json({ message: "An error occured", err: err.message });
  }
});

app.post("/create-user", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const CheckifUsersExist = await User.find({ email });

    if (CheckifUsersExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const createUser = await User.create({ name, email, password });
    res
      .status(201)
      .json({ message: "User created successfully", data: createUser });
  } catch (err: any) {
    res.status(500).json({ message: "An error occurred", err: err.message });
  }
});

app.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as Pick<User, "email" | "password">;

    const Checklogin = await User.findOne({ email });

    if (!Checklogin || Checklogin.password !== password) {
      return res.status(401).json({ message: "Invalid email and password" });
    }

    res.status(200).json({
      message: "Login successful",
      status: true,
      name: Checklogin.name,
      email: Checklogin.email,
      _id: Checklogin._id,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "An error occurred", status: false, err: err.message });
  }
});

app.patch("/update-user", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as Partial<User>;
    const updateUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, password },
      { new: true }
    );

    if (!updateUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfuly", updateUser });
  } catch (err: any) {
    res.status(500).json({ message: "An error occurred", err: err.message });
  }
});

app.delete("/delete-user/:id", async (req: Request, res: Response) => {
  try {
    const Findusertodelete = await User.findByIdAndDelete(req.params.id);

    if (!Findusertodelete) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: "An error occurred", err: err.message });
  }
});
