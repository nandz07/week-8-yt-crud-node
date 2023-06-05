const express = require('express')
const router = express.Router()
const User = require('../models/users')
const multer =require('multer')
const users = require('../models/users')  
const fs=require('fs')

// image upload

var storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./uploads')
    },
    filename:(req,file,cb)=>{
        cb(null,file.fieldname+'_'+Date.now()+'_'+file.originalname)
    },
})

var upload=multer({
    storage:storage,
}).single('image')

// insert an user into data base route

// router.post('/add',upload,(req,res)=>{
//     console.log(req.body.name);
//     const user = new User({
//         name:req.body.name,
//         email:req.body.email,
//         phone:req.body.phone,
//         image:req.body.filename
//     })
    
//     user.save((err)=>{
//         if(err){
//             req.json({message:err.message,type:'danger'})
//         }else{
//             req.session.message = {
//                 type:'success',
//                 message:'User added success'
//             }
//             res.redirect('/')
//         }
//     })
// })

router.post('/add', upload,(req, res) => {
    console.log(req.body)
   
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file.filename // Use req.file instead of req.body.filename
    });
  
    user.save()
      .then(savedUser => {
        req.session.message = {
          type: 'success',
          message: 'User added successfully'
        };
        res.redirect('/');
      })
      .catch(err => {
        res.json({ message: err.message, type: 'danger' });
      });
  });
  
// get all users
router.get('/',async(req,res)=>{
    // User.find().exec((err,users)=>{
    //     if(err){
    //         res.json({message:err.message })
    //     }else{
    //         res.render('index',{
    //             title:'Home Page',
    //             users:users
    //         })
    //     }
    // })

    // User.find().exec()
    // .then(users=>{
    //     res.render('index',{
    //         title:'Home Page',
    //         users:users
    //     })
    // })
    // .catch(err=>{
    //     res.json({message:err.message})
    // })

    try {
      const users = await User.find().exec();
      res.render('index', {
        title: 'Home Page',
        users: users
      });
    } catch (err) {
      res.json({ message: err.message });
    }
    
})
router.get('/add',(req,res)=>{
    res.render('add_users',{title:`add users`})
    // res.send('All Users')
})

// edit an user
// router.get('/edit/:id',async(req,res)=>{
//   let id = req.params.id
//   User.findById(id,(err,user)=>{
//     if(err){
//       res.redirect('/')
//     }else{
//       res.render('edit_users',{
//         title:'Edit User',
//         user:user
//       })
//     }
//   })
// })

router.get('/edit/:id',async(req,res)=>{
  try{
    const id = req.params.id
    const user = await User.findById(id).exec()

    if(user){
      res.render('edit_users',{
        title:'Edit User',
        user:user
      })
    }else{
      res.redirect('/')
    }
  }catch{
    res.redirect('/')
  }
})

// update user router
// router.post('/udate/:id',upload,(req,res)=>{
//   let id=req.params.id
//   let new_image=""

//   if(req.file){
//     new_image=req.file.filename
//     try{
//       fs.unlinkSync('./uploads'+req.body.old_image)
//     }catch(err){
//       console.log(err);
//     }
//   }else{
//     new_name=req.body.old_image
//   }
//   User.findByIdAndUpdate(id,{
//       name: req.body.name,
//       email: req.body.email,
//       phone: req.body.phone,
//       image: new_image
//   },(err,result)=>{
//     if(err){
//       res.json({message:err.message,type:'danger'})
//     }else{
//       req.session.message={
//         type:'success',
//         message:'User updated successfully'
//       }
//       res.redirect('/')
//     }
//   })
// })
router.post('/update/:id', upload, async (req, res) => {
  try {
    const id = req.params.id;
    let newImage = "";

    if (req.file) {
      newImage = req.file.filename;
      try {
        fs.unlinkSync('./uploads/' + req.body.old_image);
      } catch (err) {
        console.log(err);
      }
    } else {
      newImage = req.body.old_image;
    }

    await User.findByIdAndUpdate(id, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: newImage
    }).exec();

    req.session.message = {
      type: 'success',
      message: 'User updated successfully'
    };

    res.redirect('/');
  } catch (err) {
    res.json({ message: err.message, type: 'danger' });
  }
});

// router.get('/delete/:id',(req,res)=>{
  
//   let id=req.params.id
//   User.findByIdAndRemove(id,(err,result)=>{
//     if(result.image != ''){
//       try{
//         fs.unlinkSync('./uploads/'+result.image)
//       }catch(err){
//         console.log(err);
//       }
//     }
//     if(err){
//       res.json({message:err.message})
//     }else{
//       req.session.message={
//         type:'info',
//         message:'User deleted successfully'
//       }
//       res.redirect('/')
//     }
//   })
// })
router.get('/delete/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await User.findByIdAndRemove(id).exec();

    if (result.image !== '') {
      try {
        fs.unlinkSync('./uploads/' + result.image);
      } catch (err) {
        console.log(err);
      }
    }

    req.session.message = {
      type: 'info',
      message: 'User deleted successfully'
    };

    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.json({ message: err.message });
  }
});




module.exports = router;