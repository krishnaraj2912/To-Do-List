const express = require("express")
const bodyParser = require("body-parser")
const date = require(__dirname + "/date.js")
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express()

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))
app.set("view engine","ejs")

mongoose.connect("mongodb+srv://admin-krish:Test123@cluster0.egn6c.mongodb.net/todolistDB")

const day = date.getDate()

const taskSchema = {
    name: String
}

const Task = mongoose.model("Task",taskSchema)

const listSchema = {
    name: String,
    tasks: [taskSchema]
}

const List = mongoose.model("List",listSchema)

app.get("/",function(req,res){
    Task.find({},function(err,result){
        res.render("list",{listTitle : day,tasks : result})
    })
})

app.get("/:customListName",function(req,res){
    const customlistName = _.capitalize(req.params.customListName)

    List.findOne({name: customlistName},function(err,result){
        if(!err){
            if(result){
                res.render("list",{listTitle : customlistName,tasks : result.tasks})
            }
            else{
                const list = new List({
                    name: customlistName,
                    items: []
                });
                list.save();
                res.render("list",{listTitle : customlistName,tasks : []})
            }
        }
    })
})

app.post("/",function(req,res){
    let item = req.body.work1
    let listName = req.body.list
    
    const task = new Task({
        name: item
    })
    if(listName === day){
        task.save()
        res.redirect("/")
    }
    else{
        List.findOne({name: listName},function(err,result){
            result.tasks.push(task)
            result.save()
            res.redirect("/" + listName)
        })
    }
})

app.post("/delete",function(req,res){
    const id = req.body.checkbox
    const listName = req.body.listName
    if(listName === day){
        Task.findByIdAndRemove(id,function(err){
            if(err){
                console.log(err)
            }
            else{
                console.log("Successfully Deleted")
            }
        })   
        res.redirect("/")
    }
    else{
        List.findOneAndUpdate({name: listName},{$pull:{tasks: {_id: id}}},function(err,result){
            if(!err){
                res.redirect("/"+listName)
            }
        })
    }
})
let port = process.env.PORT
if(port == null || port == ""){
    port = 3000
}
app.listen(port,function(){
    console.log("Server has started successfully.")
})