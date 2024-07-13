const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js");
main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});
async function main(){
    await mongoose.connect(MONGO_URL);
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.get("/",(req,res)=>{
    res.send("Hi, I am Root");
});
const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);

    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else next();
}


//index route
app.get("/listings",wrapAsync(async (req,res)=>{
  const allListings=await  Listing.find({});
  res.render("listings/index.ejs",{allListings});
   
    }));
    //new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});
    //Show Route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}));
//create route
app.post("/listings",validateListing,wrapAsync(async (req,res)=>{
 
    const newlisting=new Listing(req.body.listing);
    console.log(newlisting);
     await newlisting.save();
    res.redirect("/listings");
}));
//Edit route
app.get("/listings/:id/edit", wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));
//update route
app.put("/listings/:id",validateListing,wrapAsync(async (req,res)=>{
   
    let {id}=req.params;
   await Listing.findByIdAndUpdate(id,{...req.body.listing});
   res.redirect(`/listings/${id}`);
}));
//Delete route
app.delete("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
   let deleted= await Listing.findByIdAndDelete(id);
     console.log(deleted);
    res.redirect("/listings");
}));

// app.get("/test",async (req,res)=>{
// let sample=new Listing({
//     title:"My nwe Villa",
//     description:"By the beach",
//     price: 1200,
//     location:"Calangute, Goa",
//     country:"India",
// });
//  await sample.save();
//  console.log("sample was saved");
//  res.send("success");
// });
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});
app.use((err,req,res,next)=>{
    let {status = 500,message="Something went wrong!"}=err;
   res.status(status).render("./listings/error.ejs",{err});
});
app.listen(8000,()=>{
    console.log("server is listening to 8000 ")

});