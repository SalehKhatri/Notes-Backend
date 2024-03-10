const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");
const { create } = require("../models/User");

//ROUTE 1 :Get all notes GET "/api/notes/fetchallnotes". login required

router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const note = await Note.find({ user: req.user.id });
    res.json(note);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("internal server error");
  }
});

//ROUTE 2 :add a new note using POST "/api/notes/addnote". login required

router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter valid title").isLength({ min: 3 }),
    body("description", "description must be minimum 5 characters").isLength({
      min: 5,
    }), //Validation the data to be entered in db with help of express validator package
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const error = validationResult(req);
      if (!error.isEmpty()) {
        console.log(" error");
        return res.status(400).json({ errors: error.array() }); //show any error while inserting data into db
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      console.log(error.message);
      return res.status(500).send("internal server error");
    }
  }
);

//ROUTE 3 :Update an existing note using PUT "/api/notes/updatenote". login required
router.put("/updatenote/:id",fetchuser, async (req, res) => {
    const {title,description,tag}=req.body;
    const newNote={};
    try{
    if(title){newNote.title=title};
    if(description){newNote.description=description};
    if(tag){newNote.tag=tag};

    //Find the note to be updated
    let note= await Note.findById(req.params.id);

    if(!note){return res.status(404).send('Not Found!')}

    if(note.user.toString() !== req.user.id){return res.status(401).send('Not allowed')}

    note=await Note.findByIdAndUpdate(req.params.id, {$set:newNote}, {new:true});
    res.json(note);
    }catch(error){
    console.log(error.message);
    return res.status(500).send("internal server error");
  }

  })

  //ROUTE 4 :Delete an existing note using DELETE "/api/notes/deletenote". login required
  router.delete("/deletenote/:id",fetchuser, async (req, res) => {

    //Find the note to be deleted
    try{
    let note= await Note.findById(req.params.id);

    if(!note){return res.status(404).send('Not Found!')}
    //Allow deletion only if user owns note
    if(note.user.toString() !== req.user.id){return res.status(401).send('Not allowed')}

    note=await Note.findByIdAndDelete(req.params.id);
    res.json({"Success":"note has been deleted",note:note});
    }catch(error){
      console.log(error.message);
      return res.status(500).send("internal server error");
    }

  })
module.exports = router;
