
//import db
const {response} = require('express')
const db=require('./db')

// import jsonweb token (JWT)
const  jwt = require('jsonwebtoken')

//logic for register
const register=(username,accno,password)=>{
    return db.User.findOne({accno}).then((response)=>{
        console.log(response);
        if(response){
            return{
                statusCode:401,
                message:"Account Number is already registered"
            }
        }
        else{
            const newUser=new db.User({
                username,
                accno,
                password,
                balance:2000,
                transactions:[]
            })
            //to store the new user in database
            newUser.save()
            //response send back to the client
            return{
                statusCode: 200,
                message:'Registration successfull'
            }
        }
    })
}

//logic for login
const login=(accno,password)=>{
    return db.User.findOne({accno,password}).then((response)=>{
        console.log(response);
        if(response){
            //token generation
            const token = jwt.sign({
                loginAccno:accno
            },'superkey2023')

            // if accno and password are in db
            return{
                statusCode:200,
                message:"Login Successfull",
                currentUser:response.username,//current username sent to forntend
                balance:response.balance,// current balance of user
                token,
                currentAccno:accno
            }     
        }
        else{
            return{
            statusCode:401,
            message:"Invalid Login Id"
            }      
        }
    })
}

// logic for getting  main balance
const getBalance = (accno) =>{
    return db.User.findOne({accno}).then((result)=>{
        if(result){
            return{
                statusCode:200,
                balance:result.balance
            }
        }
        else{
            return{
                statusCode:401,
                message:'Invalid accno'
            }
        }
    })
}

//logic for fund transfer
const fundTransfer=(fromAccno,frompswd,toAccno,amt)=>{
    //convert amt to a number
    let amount = parseInt(amt)

    return db.User.findOne({accno:fromAccno,password:frompswd}).then((debit)=>{
        if(debit){
            // check toAccno in mongodb
            return db.User.findOne({accno:toAccno}).then((credit)=>{
                //fund transfer
                if(credit){
                    if(debit.balance>=amount){
                        debit.balance-=amount
                        debit.transactions.push({
                            type:'Debit',
                            amount,
                            fromAccno,
                            toAccno
                        })
                    }
                    else{
                        return{
                            statusCode:401,
                            message:'Insufficent Balance'
                        }
                    }
                    //save changes into database
                    debit.save()

                    credit.balance+=amount
                    credit.transactions.push({
                        type:'Credit',
                        amount,
                        fromAccno,
                        toAccno
                    })
                    //save changes into database
                    credit.save()

                    //send response back to client
                    return {
                        statusCode:200,
                        message:'Fund transfer successfull..'
                        
                }
                }
                else{
                    return{
                        statusCode:401,
                        message:'Invalid Credit Details'
                    }
                }
            })
        }
        else{
            return{
                statusCode:401,
                message:'Invalid Debit Details'
            }
        }
    })

}

//transaction history
const transactionHistory=(accno)=>{
    //check accno present in mongodb
    return db.User.findOne({accno}).then((result)=>{
        if(result){
            return{
                statusCode:200,
                transactions:result.transactions
            }
        }
        else{
            return{
                statusCode:401,
                message:'Invalid Data'
            }
        }
    })

}


// delete account function
const deleteAccount=(accno)=>{
    return db.User.deleteOne({accno}).then((result)=>{
        return{
            statusCode: 200,
            message: "Account deleted successfully"
        }
    })

}


module.exports={
    register,
    login,
    getBalance,
    fundTransfer,
    transactionHistory,
    deleteAccount
}