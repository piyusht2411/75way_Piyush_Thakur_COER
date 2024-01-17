import nodemailer from 'nodemailer';
//emailer function for sending mails
export  const sendMail = (email:String,mailSubject:String,body:String) => {

        const mailData:any = {
            from : process.env.NODE_EMAIL,
            to : email,
            subject : mailSubject,
            text : body
        }

        const transporter = nodemailer.createTransport({
            service : 'gmail',
            auth : {
                user : process.env.NODE_EMAIL,
                pass : process.env.NODEMAIL_PASS
            }
        })


        transporter.sendMail(mailData,async(err,info)=>{
            if(err){
                console.log(err) ;
                return false ;
            }
            else{
                console.log("Mail sent")
                return true ;   
            }
        })

        return true ;
}