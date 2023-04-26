const User = require("../models/User");
const Contact = require("../models/Contact");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const mailgun = require("mailgun-js");
const bcrypt = require("bcryptjs");

const DOMAIN = process.env.MAILGUN_SERVER;
const { generateOTP, convertBase } = require("../utilities/otp");
const cloudinary = require("cloudinary").v2;
const request = require("request");
const date = new Date().getUTCFullYear();
const fs = require("fs");
const BankStatement = require("../models/BankStatement");
const sendEmail = require("./../utilities/sendEmail");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
});

const registerEmail = async (req, res) => {
  const { email, password, firstname, lastname, phone } = req.body;

  if (!email || !password || !firstname || !lastname || !phone) {
    return res.status(400).json({
      msg: "Enter all Fields",
      status: "invalid",
    });
  }
  if (phone.length !== 11) {
    return res.status(400).json({
      msg: "Incomplete Phone Number",
      status: "invalid",
    });
  }

  const user = await User.findOne({ email });
  const userPhone = await User.findOne({ phone });

  if (user) {
    return res.status(400).json({
      msg: "Email Already Exist",
      status: "invalid",
    });
  }

  if (userPhone) {
    return res.status(400).json({
      msg: "User with this Phone Number Already Exist",
      status: "invalid",
    });
  }

  const salt = await bcrypt.genSaltSync(10);
  const hashpassword = await bcrypt.hash(password, salt);

  const otp = generateOTP();

  // const data = {
  //   otp: otp,
  // };

  // using send grid to send out emails
  // sendEmail.sendGridEmail(
  //   email, // recipient email
  //   "d-b978e6208d1c458787352650489b40e2", // template id
  //   "Congratulations 🎉, Welcome to Edike", // subject
  //   data
  // );

  // response...
  // const customers = await User.find({});

  // const newUser = await User.create({
  //   customer_reference: `EDK/${customers.length + 1}`,
  //   firstname: req.body.firstname,
  //   lastname: req.body.lastname,
  //   email: req.body.email,
  //   password: hashpassword,
  //   phone: `+234${req.body.phone}`,
  //   otpToken: otp,
  //   isAccountVerified: "pending",
  //   isnin: "pending",
  //   isbvn: "pending",
  //   isappliedforloan: "pending",
  //   iscardadded: "pending",
  //   isbankstatementadded: "pending",
  //   isidcard: "pending",
  //   isaddressadded: "pending",
  //   isnextofkin: "pending",
  // });

  // await newUser.save();

  // return res.status(200).json({
  //   msg: "We've sent a 6-digit Activation Code to your Email Address",
  //   status: "valid",
  // });

  const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN });
  const data = {
    from: `${process.env.EMAIL_FROM}`,
    to: email,
    subject: "Edike OTP Verification",
    html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
    <!--[if (gte mso 9)|(IE)]>
  <xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
<![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- So that mobile will display zoomed in -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- enable media queries for windows phone 8 -->
    <meta name="format-detection" content="telephone=no"> <!-- disable auto telephone linking in iOS -->
    <meta name="format-detection" content="date=no"> <!-- disable auto date linking in iOS -->
    <meta name="format-detection" content="address=no"> <!-- disable auto address linking in iOS -->
    <meta name="format-detection" content="email=no"> <!-- disable auto email linking in iOS -->
    <meta name="color-scheme" content="only">
    <title></title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai+Looped:wght@100;200;300;400;500;600;700&family=Roboto:wght@100;300;400;500;700;900&display=swap"
        rel="stylesheet">

    <style type="text/css">
        /*Basics*/
        body {
            margin: 0px !important;
            padding: 0px !important;
            display: block !important;
            min-width: 100% !important;
            width: 100% !important;
            -webkit-text-size-adjust: none;
        }

        table {
            border-spacing: 0;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        table td {
            border-collapse: collapse;
            mso-line-height-rule: exactly;
        }

        td img {
            -ms-interpolation-mode: bicubic;
            width: auto;
            max-width: auto;
            height: auto;
            margin: auto;
            display: block !important;
            border: 0px;
        }

        td p {
            margin: 0;
            padding: 0;
        }

        td div {
            margin: 0;
            padding: 0;
        }

        td a {
            text-decoration: none;
            color: inherit;
        }

        /*Outlook*/
        .ExternalClass {
            width: 100%;
        }

        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
            line-height: inherit;
        }

        .ReadMsgBody {
            width: 100%;
            background-color: #ffffff;
        }

        /* iOS freya LINKS */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        /*Gmail freya links*/
        u+#body a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
        }

        /*Buttons fix*/
        .undoreset a,
        .undoreset a:hover {
            text-decoration: none !important;
        }

        .yshortcuts a {
            border-bottom: none !important;
        }

        .ios-footer a {
            color: #aaaaaa !important;
            text-decoration: none;
        }

        /* data-outer-table="800 - 600" */
        .outer-table {
            width: 640px !important;
            max-width: 640px !important;
        }

        /* data-inner-table="780 - 540" */
        .inner-table {
            width: 580px !important;
            max-width: 580px !important;
        }

        /*Responsive-Tablet*/
        @media only screen and (max-width: 799px) and (min-width: 601px) {
            .outer-table.row {
                width: 640px !important;
                max-width: 640px !important;
            }

            .inner-table.row {
                width: 580px !important;
                max-width: 580px !important;
            }
        }

        /*Responsive-Mobile*/
        @media only screen and (max-width: 600px) and (min-width: 320px) {
            table.row {
                width: 100% !important;
                max-width: 100% !important;
            }

            td.row {
                width: 100% !important;
                max-width: 100% !important;
            }

            .img-responsive img {
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                margin: auto;
            }

            .center-float {
                float: none !important;
                margin: auto !important;
            }

            .center-text {
                text-align: center !important;
            }

            .container-padding {
                width: 100% !important;
                padding-left: 15px !important;
                padding-right: 15px !important;
            }

            .container-padding10 {
                width: 100% !important;
                padding-left: 10px !important;
                padding-right: 10px !important;
            }

            .hide-mobile {
                display: none !important;
            }

            .menu-container {
                text-align: center !important;
            }

            .autoheight {
                height: auto !important;
            }

            .m-padding-10 {
                margin: 10px 0 !important;
            }

            .m-padding-15 {
                margin: 15px 0 !important;
            }

            .m-padding-20 {
                margin: 20px 0 !important;
            }

            .m-padding-30 {
                margin: 30px 0 !important;
            }

            .m-padding-40 {
                margin: 40px 0 !important;
            }

            .m-padding-50 {
                margin: 50px 0 !important;
            }

            .m-padding-60 {
                margin: 60px 0 !important;
            }

            .m-padding-top10 {
                margin: 30px 0 0 0 !important;
            }

            .m-padding-top15 {
                margin: 15px 0 0 0 !important;
            }

            .m-padding-top20 {
                margin: 20px 0 0 0 !important;
            }

            .m-padding-top30 {
                margin: 30px 0 0 0 !important;
            }

            .m-padding-top40 {
                margin: 40px 0 0 0 !important;
            }

            .m-padding-top50 {
                margin: 50px 0 0 0 !important;
            }

            .m-padding-top60 {
                margin: 60px 0 0 0 !important;
            }

            .m-height10 {
                font-size: 10px !important;
                line-height: 10px !important;
                height: 10px !important;
            }

            .m-height15 {
                font-size: 15px !important;
                line-height: 15px !important;
                height: 15px !important;
            }

            .m-height20 {
                font-size: 20px !important;
                line-height: 20px !important;
                height: 20px !important;
            }

            .m-height25 {
                font-size: 25px !important;
                line-height: 25px !important;
                height: 25px !important;
            }

            .m-height30 {
                font-size: 30px !important;
                line-height: 30px !important;
                height: 30px !important;
            }

            .radius6 {
                border-radius: 6px !important;
            }

            .fade-white {
                background-color: rgba(255, 255, 255, 0.8) !important;
            }

            .rwd-on-mobile {
                display: inline-block !important;
                padding: 5px !important;
            }

            .center-on-mobile {
                text-align: center !important;
            }

            .rwd-col {
                width: 100% !important;
                max-width: 100% !important;
                display: inline-block !important;
            }

            .type48 {
                font-size: 48px !important;
                line-height: 48px !important;
            }
        }
    </style>
    <style type="text/css" class="export-delete">
        .composer--mobile table.row {
            width: 100% !important;
            max-width: 100% !important;
        }

        .composer--mobile td.row {
            width: 100% !important;
            max-width: 100% !important;
        }

        .composer--mobile .img-responsive img {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            margin: auto;
        }

        .composer--mobile .center-float {
            float: none !important;
            margin: auto !important;
        }

        .composer--mobile .center-text {
            text-align: center !important;
        }

        .composer--mobile .container-padding {
            width: 100% !important;
            padding-left: 15px !important;
            padding-right: 15px !important;
        }

        .composer--mobile .container-padding10 {
            width: 100% !important;
            padding-left: 10px !important;
            padding-right: 10px !important;
        }

        .composer--mobile .hide-mobile {
            display: none !important;
        }

        .composer--mobile .menu-container {
            text-align: center !important;
        }

        .composer--mobile .autoheight {
            height: auto !important;
        }

        .composer--mobile .m-padding-10 {
            margin: 10px 0 !important;
        }

        .composer--mobile .m-padding-15 {
            margin: 15px 0 !important;
        }

        .composer--mobile .m-padding-20 {
            margin: 20px 0 !important;
        }

        .composer--mobile .m-padding-30 {
            margin: 30px 0 !important;
        }

        .composer--mobile .m-padding-40 {
            margin: 40px 0 !important;
        }

        .composer--mobile .m-padding-50 {
            margin: 50px 0 !important;
        }

        .composer--mobile .m-padding-60 {
            margin: 60px 0 !important;
        }

        .composer--mobile .m-padding-top10 {
            margin: 30px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top15 {
            margin: 15px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top20 {
            margin: 20px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top30 {
            margin: 30px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top40 {
            margin: 40px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top50 {
            margin: 50px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top60 {
            margin: 60px 0 0 0 !important;
        }

        .composer--mobile .m-height10 {
            font-size: 10px !important;
            line-height: 10px !important;
            height: 10px !important;
        }

        .composer--mobile .m-height15 {
            font-size: 15px !important;
            line-height: 15px !important;
            height: 15px !important;
        }

        .composer--mobile .m-height20 {
            font-srobotoize: 20px !important;
            line-height: 20px !important;
            height: 20px !important;
        }

        .composer--mobile .m-height25 {
            font-size: 25px !important;
            line-height: 25px !important;
            height: 25px !important;
        }

        .composer--mobile .m-height30 {
            font-size: 30px !important;
            line-height: 30px !important;
            height: 30px !important;
        }

        .composer--mobile .radius6 {
            border-radius: 6px !important;
        }

        .composer--mobile .fade-white {
            background-color: rgba(255, 255, 255, 0.8) !important;
        }

        .composer--mobile .rwd-on-mobile {
            display: inline-block !important;
            padding: 5px !important;
        }

        .composer--mobile .center-on-mobile {
            text-align: center !important;
        }

        .composer--mobile .rwd-col {
            width: 100% !important;
            max-width: 100% !important;
            display: inline-block !important;
        }

        .composer--mobile .type48 {
            font-size: 48px !important;
            line-height: 48px !important;
        }
    </style>
</head>

<body data-bgcolor="Body"
    style="margin-top: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;"
    bgcolor="#FAEEE7">

    <span class="preheader-text" data-preheader-text
        style="color: transparent; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; visibility: hidden; width: 0; display: none; mso-hide: all;"></span>

    <!-- Preheader white space hack -->
    <div style="display: none; max-height: 0px; overflow: hidden;">
        &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
    </div>

    <div data-primary-font="IBM Plex Sans Thai Looped" data-secondary-font="Roboto"
        style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;">
    </div>

    <table border="0" align="center" cellpadding="0" cellspacing="0" width="100%" style="width:100%;max-width:100%;">
        <tr><!-- Outer Table -->
            <td align="center" data-bgcolor="Body" bgcolor="#E6E5E5" data-composer>

                <table data-outer-table border="0" align="center" cellpadding="0" cellspacing="0"
                    class="outer-table row" role="presentation" width="640" style="width:640px;max-width:640px;"
                    data-module="freya-logo">
                    <!-- freya-logo -->
                    <tr>
                        <td align="center">

                            <!-- Content -->
                            <table border="0" align="center" cellpadding="0" cellspacing="0" role="presentation"
                                width="100%" style="width:100%;max-width:100%;">
                                <tr data-element="freya-brand-colors" data-label="Brand Colors">
                                    <td align="center">
                                        <!-- Brand Colors -->
                                        <table border="0" align="center" cellpadding="0" cellspacing="0"
                                            role="presentation" width="100%" style="width:100%;max-width:100%;">
                                            <tr>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="1st Color"
                                                    bgcolor="#0C6B55" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="2nd Color"
                                                    bgcolor="#45B88F" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="3rd Color"
                                                    bgcolor="#A9DE90" style="width:33.33%;"></td>
                                            </tr>
                                        </table>
                                        <!-- Brand Colors -->
                                    </td>
                                </tr>
                                <tr>
                                    <td height="40" style="font-size:40px;line-height:40px;" data-height="Spacing top">
                                        &nbsp;</td>
                                </tr>
                                <tr data-element="freya-logo" data-label="Logo">
                                    <td align="center">
                                        <table data-inner-table border="0" align="center" cellpadding="0"
                                            cellspacing="0" class="inner-table row container-padding"
                                            role="presentation" width="580" style="width:580px;max-width:580px;">
                                            <tr>
                                                <td align="left">
                                                    <img style="width:160px;border:0px;display: inline!important;"
                                                        src="https://res.cloudinary.com/edikeeduloan/image/upload/v1671800748/edike%20logo/flbvdxkotzjvmkhqfcn5.png"
                                                        width="160" border="0" editable="true" data-icon data-image-edit
                                                        data-url data-label="Logo" data-image-width alt="logo">
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <tr>
                                    <td height="10" style="font-size:10px;line-height:10px;"
                                        data-height="Spacing bottom">&nbsp;</td>
                                </tr>
                            </table>
                            <!-- Content -->

                        </td>
                    </tr>
                    <!-- freya-logo -->
                </table>

                <table data-outer-table border="0" align="center" cellpadding="0" cellspacing="0"
                    class="outer-table row container-padding" role="presentation" width="640"
                    style="width:640px;max-width:640px;" data-module="freya-header-1">
                    <!-- freya-header-1 -->
                    <tr>
                        <td align="center" bgcolor="#FFFFFF" data-bgcolor="BgColor" class="container-padding">

                            <table data-inner-table border="0" align="center" cellpadding="0" cellspacing="0"
                                role="presentation" class="inner-table row" width="580"
                                style="width:580px;max-width:580px;">
                                <tr>
                                    <td class="m-height15" height="30" style="font-size:30px;line-height:30px;"
                                        data-height="Spacing top">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <!-- content -->
                                        <table border="0" align="center" cellpadding="0" cellspacing="0"
                                            role="presentation" width="100%" style="width:100%;max-width:100%;">
                                            <tr data-element="freya-header-image" data-label="Header image">
                                                <td height="40" style="font-size:40px;line-height:40px;"
                                                    data-height="Spacing under image">&nbsp;</td>
                                            </tr>
                                            <tr data-element="freya-header-headline" data-label="Header Headlines">
                                                <td class="type48" data-text-style="Header Headlines" align="left"
                                                    style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:30px;line-height:64px;font-weight:300;font-style:normal;color:#325288;text-decoration:none;letter-spacing:0px;">
                                                    <singleline>
                                                        <div mc:edit data-text-edit>
                                                            <strong> Edike OTP Verification</strong>
                                                        </div>
                                                    </singleline>
                                                </td>
                                            </tr>
                                            
                                            <tr data-element="freya-header-paragraph" data-label="Header Paragraph">
                                                <td data-text-style="Header Paragraph" align="left"
                                                    style="font-family:'Roboto',Arial,Helvetica,sans-serif;font-size:18px;line-height:32px;font-weight:400;font-style:normal;color:#666666;text-decoration:none;letter-spacing:0px;">
                                                    <singleline>
                                                        <p  style="margin-top: 30px;">Enter OTP for Account Verification.</p>
                                                        <div mc:edit data-text-edit  style="margin-top: 5px;">
                                                            We're delighted to have you on board, Let's get your email address verified. <br />
                                                            Please use this verification code below to complete your sign up process: 
                                                        </div>
                                                    </singleline>
                                                </td>
                                            </tr>
                                            
                                            <tr data-element="freya-header-paragraph" data-label="Header Paragraph">
                                                <td height="30" style="font-size:30px;line-height:30px;" data-height="Spacing under paragraph">&nbsp;</td>
                                            </tr>

                                            <tr data-element="freya-header-user-code" data-label="User code">
                                                <td align="center">
                                                    <!-- rwd-col -->
                                                    <table border="0" cellpadding="0" cellspacing="0" align="left"
                                                        role="presentation">
                                                        <tr>
                                                            <td class="rwd-col" align="center">

                                                                <table border="0" align="left" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td data-text-style="Text Style" align="left"
                                                                            style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:28px;line-height:38px;font-weight:400;font-style:normal;color:#666666;text-decoration:none;letter-spacing:0px;">
                                                                            <singleline>
                                                                                <div mc:edit data-text-edit>
                                                                                    OTP:
                                                                                </div>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>

                                                            </td>
                                                            <td class="rwd-col" align="center" width="10" height="5"
                                                                style="width:10px;max-width:10px;height:5px;">&nbsp;
                                                            </td>
                                                            <td class="rwd-col" align="center">

                                                                <table border="0" align="left" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td data-text-style="Coupon Code Style"
                                                                            align="left"
                                                                            style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:28px;line-height:38px;font-weight:700;font-style:normal;color:#D96098;text-decoration:none;letter-spacing:0px;">
                                                                            <singleline>
                                                                                <div mc:edit data-text-edit>
                                                                                    ${otp}
                                                                                </div>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>

                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <!-- rwd-col -->
                                                </td>
                                            </tr>
                                            <tr data-element="freya-header-paragraph" data-label="Header Paragraph">
                                                <td height="40" style="font-size:40px;line-height:40px;"
                                                    data-height="Spacing under paragraph">&nbsp;</td>
                                            </tr>
                                            
                                        </table>
                                        <!-- content -->
                                    </td>
                                </tr>
                                <tr>
                                    <td class="m-height15" height="30" style="font-size:30px;line-height:30px;"
                                        data-height="Spacing bottom">&nbsp;</td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <table border="0" align="center" cellpadding="0" cellspacing="0" role="presentation"
                                width="90.63%" style="width:90.63%;max-width:90.63%;">
                                <tr>
                                    <td height="5" style="font-size:5px;line-height:5px;" bgcolor="#DDD2CC"
                                        data-bgcolor="Shadow Color">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- freya-header-1 -->
                </table>

                <table data-outer-table border="0" align="center" cellpadding="0" cellspacing="0"
                    class="outer-table row" role="presentation" width="640" style="width:640px;max-width:640px;"
                    data-module="freya-footer">
                    <!-- freya-footer -->
                    <tr>
                        <td align="center">

                            <table data-inner-table border="0" align="center" cellpadding="0" cellspacing="0"
                                role="presentation" class="inner-table row container-padding" width="580"
                                style="width:580px;max-width:580px;">
                                <tr>
                                    <td height="100" style="font-size:120px;line-height:120px;"
                                        data-height="Spacing top">&nbsp;</td>
                                </tr>
                                <tr data-element="freya-footer-social-icons-contact"
                                    data-label="Social Icons & Contact">
                                    <td align="center">
                                        <!-- rwd-col -->
                                        <table border="0" cellpadding="0" cellspacing="0" align="center"
                                            role="presentation" class="container-padding" width="100%"
                                            style="width:100%;max-width:100%;">
                                            <tr>
                                                <td class="rwd-col" align="center" width="41.38%"
                                                    style="width:41.38%;max-width:41.38%;">

                                                    <table border="0" align="left" cellpadding="0" cellspacing="0"
                                                        role="presentation" align="left" class="center-float">
                                                        <tr class="center-on-mobile">
                                                            <td data-element="freya-footer-facebook"
                                                                data-label="Facebook" align="left" valign="middle">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td align="center">
                                                                            <img style="width:24px;border:0px;display: inline!important;"
                                                                                src="https://i.ibb.co/xYhpJGq/facebook.png" width="24"
                                                                                border="0" editable="true" data-icon
                                                                                data-image-edit data-url
                                                                                data-label="Facebook" data-image-width
                                                                                alt="Facebook">
                                                                        </td>
                                                                        <td width="6"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                            <td data-element="freya-footer-twitter" data-label="Twitter"
                                                                align="center" valign="middle">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="6"></td>
                                                                        <td align="center">
                                                                            <img style="width:24px;border:0px;display: inline!important;"
                                                                                src="https://i.ibb.co/ZhkxYSZ/twitter.png" width="24"
                                                                                border="0" editable="true" data-icon
                                                                                data-image-edit data-url
                                                                                data-label="Twitter" data-image-width
                                                                                alt="Twitter">
                                                                        </td>
                                                                        <td width="6"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>

                                                            
                                                            <td data-element="freya-footer-instagram"
                                                                data-label="Instagram" align="center" valign="middle">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="6"></td>
                                                                        <td align="center">
                                                                            <img style="width:24px;border:0px;display: inline!important;"
                                                                                src="https://i.ibb.co/7rcjfBC/instagram.png" width="24"
                                                                                border="0" editable="true" data-icon
                                                                                data-image-edit data-url
                                                                                data-label="Instagram" data-image-width
                                                                                alt="Instagram">
                                                                        </td>
                                                                        <td width="6"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                </td>
                                                <td class="rwd-col" align="center" width="1.62%" height="20"
                                                    style="width:1.62%;max-width:1.62%;height:20px;">&nbsp;</td>
                                                <td class="rwd-col" align="center" width="57%"
                                                    style="width:57%;max-width:57%;">

                                                    <table border="0" cellpadding="0" cellspacing="0" align="right"
                                                        role="presentation" class="center-float">
                                                        <tr class="center-on-mobile">
                                                            <td data-element="freya-footer-email" data-label="Email"
                                                                class="rwd-on-mobile row" align="center"
                                                                valign="middle">
                                                                <!-- Links -->
                                                                <table border="0" cellspacing="0" cellpadding="0"
                                                                    class="center-float">
                                                                    <tr>
                                                                        <td align="center">
                                                                            <singleline>
                                                                                <a href="mailto:info@edike.info" mc:edit
                                                                                    data-button data-text-style="Links"
                                                                                    style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:500;font-style:normal;color:#000000;text-decoration:none;letter-spacing:0px;"><span>info@edike.info</span></a>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                <!-- Links -->
                                                            </td>
                                                            <td data-element="freya-footer-gap" data-label="Gap"
                                                                class="hide-mobile" calign="center">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="5"></td>
                                                                        <td class="center-text"
                                                                            data-text-style="Paragraphs" align="center"
                                                                            style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:500;font-style:normal;color:#666666;text-decoration:none;letter-spacing:0px;">
                                                                            |</td>
                                                                        <td width="5"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                            <td data-element="freya-footer-phone-number"
                                                                data-label="Phone number" class="rwd-on-mobile row"
                                                                align="center" valign="middle">
                                                                <!-- Links -->
                                                                <table border="0" cellspacing="0" cellpadding="0"
                                                                    class="center-float">
                                                                    <tr>
                                                                        <td align="center">
                                                                            <singleline>
                                                                                <a href="tel:+33-738-198-7926" mc:edit
                                                                                    data-button data-text-style="Links"
                                                                                    style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:500;font-style:normal;color:#000000;text-decoration:none;letter-spacing:0px;"><span>+234 702 5000 490</span></a>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                <!-- Links -->
                                                            </td>
                                                        </tr>
                                                    </table>

                                                </td>
                                            </tr>
                                        </table>
                                        <!-- rwd-col -->
                                    </td>
                                </tr>
                                <tr data-element="freya-footer-social-icons-contact"
                                    data-label="Social Icons & Contact">
                                    <td height="30" style="font-size:30px;line-height:30px;"
                                        data-height="Spacing under social icons & contact">&nbsp;</td>
                                </tr>
                                <tr data-element="freya-footer-copyrights-apps" data-label="Copyrights & Apps">
                                    <td height="20" style="font-size:20px;line-height:20px;"
                                        data-height="Spacing under copyrights & apps">&nbsp;</td>
                                </tr>
                            </table>

                            <table border="0" align="center" cellpadding="0" cellspacing="0" role="presentation"
                                width="100%" style="width:100%;max-width:100%;">
                                <tr data-element="freya-brand-colors" data-label="Brand Colors">
                                    <td align="center">
                                        <!-- Brand Colors -->
                                        <table border="0" align="center" cellpadding="0" cellspacing="0"
                                            role="presentation" width="100%" style="width:100%;max-width:100%;">
                                            <tr>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="1st Color"
                                                    bgcolor="#0C6B55" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="2nd Color"
                                                    bgcolor="#45B88F" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="3rd Color"
                                                    bgcolor="#A9DE90" style="width:33.33%;"></td>
                                            </tr>
                                        </table>
                                        <!-- Brand Colors -->
                                    </td>
                                </tr>
                                <tr data-element="freya-footer-tags" data-label="Footer Tags">
                                    <td align="center" bgcolor="#FFFFFF" data-bgcolor="Footer BgColor">

                                        <table data-inner-table border="0" align="center" cellpadding="0"
                                            cellspacing="0" role="presentation"
                                            class="inner-table row container-padding" width="580"
                                            style="width:580px;max-width:580px;">
                                            <tr>
                                                <td height="20" style="font-size:20px;line-height:20px;"
                                                    data-height="Spacing under brand colors">&nbsp;</td>
                                            </tr>
                                            <tr data-element="freya-footer-permission-reminder"
                                                data-label="Permission reminder">
                                                <td data-text-style="Paragraphs" align="left" class="center-text"
                                                    style="font-family:'Roboto',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:400;font-style:normal;color:#333333;text-decoration:none;letter-spacing:0px;">
                                                    <singleline>
                                                        <div mc:edit data-text-edit>
                                                            Copyright © 2023 Edike. All rights reserved | Powered by <br />
                                                            Competence Asset Management Company Limited.
                                                        </div>
                                                    </singleline>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td height="30" style="font-size:30px;line-height:30px;"
                                                    data-height="Spacing under tags">&nbsp;</td>
                                            </tr>
                                        </table>

                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    <tr class="hide-mobile">
                        <td height="30" style="font-size:30px;line-height:30px;" data-height="Spacing bottom">&nbsp;
                        </td>
                    </tr>
                    <!-- freya-footer -->
                </table>

            </td>
        </tr><!-- Outer-Table -->
    </table>

</body>

</html>
    `,
  };
  mg.messages().send(data, async function (error) {
    if (error) {
      return res.status(400).json({
        msg: error.message,
      });
    }

    const customers = await User.find({});

    const newUser = await User.create({
      customer_reference: `EDK/${customers.length + 1}`,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: hashpassword,
      phone: `+234${req.body.phone}`,
      otpToken: otp,
      isAccountVerified: "pending",
      isnin: "pending",
      isbvn: "pending",
      isappliedforloan: "pending",
      iscardadded: "pending",
      isbankstatementadded: "pending",
      isidcard: "pending",
      isaddressadded: "pending",
      isnextofkin: "pending",
    });

    await newUser.save();

    return res.status(200).json({
      msg: "We've sent a 6-digit Activation Code to your Email Address",
      status: "valid",
    });
  });
};

const resendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      msg: "Kindly Enter your Email Account with us",
      status: "invalid",
    });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      msg: "Invalid Email Address",
      status: "invalid",
    });
  }
  const otp = generateOTP();

  user.otpToken = otp;
  await user.save();

  // const data = {
  //   otp: otp,
  // };

  // // using send grid to send out emails
  // sendEmail.sendGridEmail(
  //   email, // recipient email
  //   "d-39770c5c4609466dbb05b5af4fbdd5f6", // template id
  //   "Edike OTP Verification", // subject
  //   data
  // );

  // return res.status(200).json({
  //   msg: "We've sent a 6-digit Activation Code to your Email Address",
  //   status: "valid",
  // });

  const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN });
  const data = {
    from: `${process.env.EMAIL_FROM}`,
    to: email,
    subject: "Edike OTP Verification",
    html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
    <!--[if (gte mso 9)|(IE)]>
  <xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
<![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- So that mobile will display zoomed in -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- enable media queries for windows phone 8 -->
    <meta name="format-detection" content="telephone=no"> <!-- disable auto telephone linking in iOS -->
    <meta name="format-detection" content="date=no"> <!-- disable auto date linking in iOS -->
    <meta name="format-detection" content="address=no"> <!-- disable auto address linking in iOS -->
    <meta name="format-detection" content="email=no"> <!-- disable auto email linking in iOS -->
    <meta name="color-scheme" content="only">
    <title></title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai+Looped:wght@100;200;300;400;500;600;700&family=Roboto:wght@100;300;400;500;700;900&display=swap"
        rel="stylesheet">

    <style type="text/css">
        /*Basics*/
        body {
            margin: 0px !important;
            padding: 0px !important;
            display: block !important;
            min-width: 100% !important;
            width: 100% !important;
            -webkit-text-size-adjust: none;
        }

        table {
            border-spacing: 0;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        table td {
            border-collapse: collapse;
            mso-line-height-rule: exactly;
        }

        td img {
            -ms-interpolation-mode: bicubic;
            width: auto;
            max-width: auto;
            height: auto;
            margin: auto;
            display: block !important;
            border: 0px;
        }

        td p {
            margin: 0;
            padding: 0;
        }

        td div {
            margin: 0;
            padding: 0;
        }

        td a {
            text-decoration: none;
            color: inherit;
        }

        /*Outlook*/
        .ExternalClass {
            width: 100%;
        }

        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
            line-height: inherit;
        }

        .ReadMsgBody {
            width: 100%;
            background-color: #ffffff;
        }

        /* iOS freya LINKS */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        /*Gmail freya links*/
        u+#body a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
        }

        /*Buttons fix*/
        .undoreset a,
        .undoreset a:hover {
            text-decoration: none !important;
        }

        .yshortcuts a {
            border-bottom: none !important;
        }

        .ios-footer a {
            color: #aaaaaa !important;
            text-decoration: none;
        }

        /* data-outer-table="800 - 600" */
        .outer-table {
            width: 640px !important;
            max-width: 640px !important;
        }

        /* data-inner-table="780 - 540" */
        .inner-table {
            width: 580px !important;
            max-width: 580px !important;
        }

        /*Responsive-Tablet*/
        @media only screen and (max-width: 799px) and (min-width: 601px) {
            .outer-table.row {
                width: 640px !important;
                max-width: 640px !important;
            }

            .inner-table.row {
                width: 580px !important;
                max-width: 580px !important;
            }
        }

        /*Responsive-Mobile*/
        @media only screen and (max-width: 600px) and (min-width: 320px) {
            table.row {
                width: 100% !important;
                max-width: 100% !important;
            }

            td.row {
                width: 100% !important;
                max-width: 100% !important;
            }

            .img-responsive img {
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                margin: auto;
            }

            .center-float {
                float: none !important;
                margin: auto !important;
            }

            .center-text {
                text-align: center !important;
            }

            .container-padding {
                width: 100% !important;
                padding-left: 15px !important;
                padding-right: 15px !important;
            }

            .container-padding10 {
                width: 100% !important;
                padding-left: 10px !important;
                padding-right: 10px !important;
            }

            .hide-mobile {
                display: none !important;
            }

            .menu-container {
                text-align: center !important;
            }

            .autoheight {
                height: auto !important;
            }

            .m-padding-10 {
                margin: 10px 0 !important;
            }

            .m-padding-15 {
                margin: 15px 0 !important;
            }

            .m-padding-20 {
                margin: 20px 0 !important;
            }

            .m-padding-30 {
                margin: 30px 0 !important;
            }

            .m-padding-40 {
                margin: 40px 0 !important;
            }

            .m-padding-50 {
                margin: 50px 0 !important;
            }

            .m-padding-60 {
                margin: 60px 0 !important;
            }

            .m-padding-top10 {
                margin: 30px 0 0 0 !important;
            }

            .m-padding-top15 {
                margin: 15px 0 0 0 !important;
            }

            .m-padding-top20 {
                margin: 20px 0 0 0 !important;
            }

            .m-padding-top30 {
                margin: 30px 0 0 0 !important;
            }

            .m-padding-top40 {
                margin: 40px 0 0 0 !important;
            }

            .m-padding-top50 {
                margin: 50px 0 0 0 !important;
            }

            .m-padding-top60 {
                margin: 60px 0 0 0 !important;
            }

            .m-height10 {
                font-size: 10px !important;
                line-height: 10px !important;
                height: 10px !important;
            }

            .m-height15 {
                font-size: 15px !important;
                line-height: 15px !important;
                height: 15px !important;
            }

            .m-height20 {
                font-size: 20px !important;
                line-height: 20px !important;
                height: 20px !important;
            }

            .m-height25 {
                font-size: 25px !important;
                line-height: 25px !important;
                height: 25px !important;
            }

            .m-height30 {
                font-size: 30px !important;
                line-height: 30px !important;
                height: 30px !important;
            }

            .radius6 {
                border-radius: 6px !important;
            }

            .fade-white {
                background-color: rgba(255, 255, 255, 0.8) !important;
            }

            .rwd-on-mobile {
                display: inline-block !important;
                padding: 5px !important;
            }

            .center-on-mobile {
                text-align: center !important;
            }

            .rwd-col {
                width: 100% !important;
                max-width: 100% !important;
                display: inline-block !important;
            }

            .type48 {
                font-size: 48px !important;
                line-height: 48px !important;
            }
        }
    </style>
    <style type="text/css" class="export-delete">
        .composer--mobile table.row {
            width: 100% !important;
            max-width: 100% !important;
        }

        .composer--mobile td.row {
            width: 100% !important;
            max-width: 100% !important;
        }

        .composer--mobile .img-responsive img {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            margin: auto;
        }

        .composer--mobile .center-float {
            float: none !important;
            margin: auto !important;
        }

        .composer--mobile .center-text {
            text-align: center !important;
        }

        .composer--mobile .container-padding {
            width: 100% !important;
            padding-left: 15px !important;
            padding-right: 15px !important;
        }

        .composer--mobile .container-padding10 {
            width: 100% !important;
            padding-left: 10px !important;
            padding-right: 10px !important;
        }

        .composer--mobile .hide-mobile {
            display: none !important;
        }

        .composer--mobile .menu-container {
            text-align: center !important;
        }

        .composer--mobile .autoheight {
            height: auto !important;
        }

        .composer--mobile .m-padding-10 {
            margin: 10px 0 !important;
        }

        .composer--mobile .m-padding-15 {
            margin: 15px 0 !important;
        }

        .composer--mobile .m-padding-20 {
            margin: 20px 0 !important;
        }

        .composer--mobile .m-padding-30 {
            margin: 30px 0 !important;
        }

        .composer--mobile .m-padding-40 {
            margin: 40px 0 !important;
        }

        .composer--mobile .m-padding-50 {
            margin: 50px 0 !important;
        }

        .composer--mobile .m-padding-60 {
            margin: 60px 0 !important;
        }

        .composer--mobile .m-padding-top10 {
            margin: 30px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top15 {
            margin: 15px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top20 {
            margin: 20px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top30 {
            margin: 30px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top40 {
            margin: 40px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top50 {
            margin: 50px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top60 {
            margin: 60px 0 0 0 !important;
        }

        .composer--mobile .m-height10 {
            font-size: 10px !important;
            line-height: 10px !important;
            height: 10px !important;
        }

        .composer--mobile .m-height15 {
            font-size: 15px !important;
            line-height: 15px !important;
            height: 15px !important;
        }

        .composer--mobile .m-height20 {
            font-srobotoize: 20px !important;
            line-height: 20px !important;
            height: 20px !important;
        }

        .composer--mobile .m-height25 {
            font-size: 25px !important;
            line-height: 25px !important;
            height: 25px !important;
        }

        .composer--mobile .m-height30 {
            font-size: 30px !important;
            line-height: 30px !important;
            height: 30px !important;
        }

        .composer--mobile .radius6 {
            border-radius: 6px !important;
        }

        .composer--mobile .fade-white {
            background-color: rgba(255, 255, 255, 0.8) !important;
        }

        .composer--mobile .rwd-on-mobile {
            display: inline-block !important;
            padding: 5px !important;
        }

        .composer--mobile .center-on-mobile {
            text-align: center !important;
        }

        .composer--mobile .rwd-col {
            width: 100% !important;
            max-width: 100% !important;
            display: inline-block !important;
        }

        .composer--mobile .type48 {
            font-size: 48px !important;
            line-height: 48px !important;
        }
    </style>
</head>

<body data-bgcolor="Body"
    style="margin-top: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;"
    bgcolor="#FAEEE7">

    <span class="preheader-text" data-preheader-text
        style="color: transparent; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; visibility: hidden; width: 0; display: none; mso-hide: all;"></span>

    <!-- Preheader white space hack -->
    <div style="display: none; max-height: 0px; overflow: hidden;">
        &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
    </div>

    <div data-primary-font="IBM Plex Sans Thai Looped" data-secondary-font="Roboto"
        style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;">
    </div>

    <table border="0" align="center" cellpadding="0" cellspacing="0" width="100%" style="width:100%;max-width:100%;">
        <tr><!-- Outer Table -->
            <td align="center" data-bgcolor="Body" bgcolor="#E6E5E5" data-composer>

                <table data-outer-table border="0" align="center" cellpadding="0" cellspacing="0"
                    class="outer-table row" role="presentation" width="640" style="width:640px;max-width:640px;"
                    data-module="freya-logo">
                    <!-- freya-logo -->
                    <tr>
                        <td align="center">

                            <!-- Content -->
                            <table border="0" align="center" cellpadding="0" cellspacing="0" role="presentation"
                                width="100%" style="width:100%;max-width:100%;">
                                <tr data-element="freya-brand-colors" data-label="Brand Colors">
                                    <td align="center">
                                        <!-- Brand Colors -->
                                        <table border="0" align="center" cellpadding="0" cellspacing="0"
                                            role="presentation" width="100%" style="width:100%;max-width:100%;">
                                            <tr>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="1st Color"
                                                    bgcolor="#0C6B55" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="2nd Color"
                                                    bgcolor="#45B88F" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="3rd Color"
                                                    bgcolor="#A9DE90" style="width:33.33%;"></td>
                                            </tr>
                                        </table>
                                        <!-- Brand Colors -->
                                    </td>
                                </tr>
                                <tr>
                                    <td height="40" style="font-size:40px;line-height:40px;" data-height="Spacing top">
                                        &nbsp;</td>
                                </tr>
                                <tr data-element="freya-logo" data-label="Logo">
                                    <td align="center">
                                        <table data-inner-table border="0" align="center" cellpadding="0"
                                            cellspacing="0" class="inner-table row container-padding"
                                            role="presentation" width="580" style="width:580px;max-width:580px;">
                                            <tr>
                                                <td align="left">
                                                    <img style="width:160px;border:0px;display: inline!important;"
                                                        src="https://res.cloudinary.com/edikeeduloan/image/upload/v1671800748/edike%20logo/flbvdxkotzjvmkhqfcn5.png"
                                                        width="160" border="0" editable="true" data-icon data-image-edit
                                                        data-url data-label="Logo" data-image-width alt="logo">
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <tr>
                                    <td height="10" style="font-size:10px;line-height:10px;"
                                        data-height="Spacing bottom">&nbsp;</td>
                                </tr>
                            </table>
                            <!-- Content -->

                        </td>
                    </tr>
                    <!-- freya-logo -->
                </table>

                <table data-outer-table border="0" align="center" cellpadding="0" cellspacing="0"
                    class="outer-table row container-padding" role="presentation" width="640"
                    style="width:640px;max-width:640px;" data-module="freya-header-1">
                    <!-- freya-header-1 -->
                    <tr>
                        <td align="center" bgcolor="#FFFFFF" data-bgcolor="BgColor" class="container-padding">

                            <table data-inner-table border="0" align="center" cellpadding="0" cellspacing="0"
                                role="presentation" class="inner-table row" width="580"
                                style="width:580px;max-width:580px;">
                                <tr>
                                    <td class="m-height15" height="30" style="font-size:30px;line-height:30px;"
                                        data-height="Spacing top">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <!-- content -->
                                        <table border="0" align="center" cellpadding="0" cellspacing="0"
                                            role="presentation" width="100%" style="width:100%;max-width:100%;">
                                            <tr data-element="freya-header-image" data-label="Header image">
                                                <td height="40" style="font-size:40px;line-height:40px;"
                                                    data-height="Spacing under image">&nbsp;</td>
                                            </tr>
                                            <tr data-element="freya-header-headline" data-label="Header Headlines">
                                                <td class="type48" data-text-style="Header Headlines" align="left"
                                                    style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:30px;line-height:64px;font-weight:300;font-style:normal;color:#325288;text-decoration:none;letter-spacing:0px;">
                                                    <singleline>
                                                        <div mc:edit data-text-edit>
                                                            <strong> Edike OTP Verification</strong>
                                                        </div>
                                                    </singleline>
                                                </td>
                                            </tr>
                                            
                                            <tr data-element="freya-header-paragraph" data-label="Header Paragraph">
                                                <td data-text-style="Header Paragraph" align="left"
                                                    style="font-family:'Roboto',Arial,Helvetica,sans-serif;font-size:18px;line-height:32px;font-weight:400;font-style:normal;color:#666666;text-decoration:none;letter-spacing:0px;">
                                                    <singleline>
                                                        <p  style="margin-top: 30px;">Enter OTP for Account Verification.</p>
                                                        <div mc:edit data-text-edit  style="margin-top: 5px;">
                                                            We're delighted to have you on board, Let's get your email address verified. <br />
                                                            Please use this verification code below to complete your sign up process: 
                                                        </div>
                                                    </singleline>
                                                </td>
                                            </tr>
                                            
                                            <tr data-element="freya-header-paragraph" data-label="Header Paragraph">
                                                <td height="30" style="font-size:30px;line-height:30px;" data-height="Spacing under paragraph">&nbsp;</td>
                                            </tr>

                                            <tr data-element="freya-header-user-code" data-label="User code">
                                                <td align="center">
                                                    <!-- rwd-col -->
                                                    <table border="0" cellpadding="0" cellspacing="0" align="left"
                                                        role="presentation">
                                                        <tr>
                                                            <td class="rwd-col" align="center">

                                                                <table border="0" align="left" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td data-text-style="Text Style" align="left"
                                                                            style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:28px;line-height:38px;font-weight:400;font-style:normal;color:#666666;text-decoration:none;letter-spacing:0px;">
                                                                            <singleline>
                                                                                <div mc:edit data-text-edit>
                                                                                    OTP:
                                                                                </div>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>

                                                            </td>
                                                            <td class="rwd-col" align="center" width="10" height="5"
                                                                style="width:10px;max-width:10px;height:5px;">&nbsp;
                                                            </td>
                                                            <td class="rwd-col" align="center">

                                                                <table border="0" align="left" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td data-text-style="Coupon Code Style"
                                                                            align="left"
                                                                            style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:28px;line-height:38px;font-weight:700;font-style:normal;color:#D96098;text-decoration:none;letter-spacing:0px;">
                                                                            <singleline>
                                                                                <div mc:edit data-text-edit>
                                                                                    ${otp}
                                                                                </div>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>

                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <!-- rwd-col -->
                                                </td>
                                            </tr>
                                            <tr data-element="freya-header-paragraph" data-label="Header Paragraph">
                                                <td height="40" style="font-size:40px;line-height:40px;"
                                                    data-height="Spacing under paragraph">&nbsp;</td>
                                            </tr>
                                            
                                        </table>
                                        <!-- content -->
                                    </td>
                                </tr>
                                <tr>
                                    <td class="m-height15" height="30" style="font-size:30px;line-height:30px;"
                                        data-height="Spacing bottom">&nbsp;</td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <table border="0" align="center" cellpadding="0" cellspacing="0" role="presentation"
                                width="90.63%" style="width:90.63%;max-width:90.63%;">
                                <tr>
                                    <td height="5" style="font-size:5px;line-height:5px;" bgcolor="#DDD2CC"
                                        data-bgcolor="Shadow Color">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- freya-header-1 -->
                </table>

                <table data-outer-table border="0" align="center" cellpadding="0" cellspacing="0"
                    class="outer-table row" role="presentation" width="640" style="width:640px;max-width:640px;"
                    data-module="freya-footer">
                    <!-- freya-footer -->
                    <tr>
                        <td align="center">

                            <table data-inner-table border="0" align="center" cellpadding="0" cellspacing="0"
                                role="presentation" class="inner-table row container-padding" width="580"
                                style="width:580px;max-width:580px;">
                                <tr>
                                    <td height="100" style="font-size:120px;line-height:120px;"
                                        data-height="Spacing top">&nbsp;</td>
                                </tr>
                                <tr data-element="freya-footer-social-icons-contact"
                                    data-label="Social Icons & Contact">
                                    <td align="center">
                                        <!-- rwd-col -->
                                        <table border="0" cellpadding="0" cellspacing="0" align="center"
                                            role="presentation" class="container-padding" width="100%"
                                            style="width:100%;max-width:100%;">
                                            <tr>
                                                <td class="rwd-col" align="center" width="41.38%"
                                                    style="width:41.38%;max-width:41.38%;">

                                                    <table border="0" align="left" cellpadding="0" cellspacing="0"
                                                        role="presentation" align="left" class="center-float">
                                                        <tr class="center-on-mobile">
                                                            <td data-element="freya-footer-facebook"
                                                                data-label="Facebook" align="left" valign="middle">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td align="center">
                                                                            <img style="width:24px;border:0px;display: inline!important;"
                                                                                src="https://i.ibb.co/xYhpJGq/facebook.png" width="24"
                                                                                border="0" editable="true" data-icon
                                                                                data-image-edit data-url
                                                                                data-label="Facebook" data-image-width
                                                                                alt="Facebook">
                                                                        </td>
                                                                        <td width="6"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                            <td data-element="freya-footer-twitter" data-label="Twitter"
                                                                align="center" valign="middle">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="6"></td>
                                                                        <td align="center">
                                                                            <img style="width:24px;border:0px;display: inline!important;"
                                                                                src="https://i.ibb.co/ZhkxYSZ/twitter.png" width="24"
                                                                                border="0" editable="true" data-icon
                                                                                data-image-edit data-url
                                                                                data-label="Twitter" data-image-width
                                                                                alt="Twitter">
                                                                        </td>
                                                                        <td width="6"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>

                                                            
                                                            <td data-element="freya-footer-instagram"
                                                                data-label="Instagram" align="center" valign="middle">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="6"></td>
                                                                        <td align="center">
                                                                            <img style="width:24px;border:0px;display: inline!important;"
                                                                                src="https://i.ibb.co/7rcjfBC/instagram.png" width="24"
                                                                                border="0" editable="true" data-icon
                                                                                data-image-edit data-url
                                                                                data-label="Instagram" data-image-width
                                                                                alt="Instagram">
                                                                        </td>
                                                                        <td width="6"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                </td>
                                                <td class="rwd-col" align="center" width="1.62%" height="20"
                                                    style="width:1.62%;max-width:1.62%;height:20px;">&nbsp;</td>
                                                <td class="rwd-col" align="center" width="57%"
                                                    style="width:57%;max-width:57%;">

                                                    <table border="0" cellpadding="0" cellspacing="0" align="right"
                                                        role="presentation" class="center-float">
                                                        <tr class="center-on-mobile">
                                                            <td data-element="freya-footer-email" data-label="Email"
                                                                class="rwd-on-mobile row" align="center"
                                                                valign="middle">
                                                                <!-- Links -->
                                                                <table border="0" cellspacing="0" cellpadding="0"
                                                                    class="center-float">
                                                                    <tr>
                                                                        <td align="center">
                                                                            <singleline>
                                                                                <a href="mailto:info@edike.info" mc:edit
                                                                                    data-button data-text-style="Links"
                                                                                    style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:500;font-style:normal;color:#000000;text-decoration:none;letter-spacing:0px;"><span>info@edike.info</span></a>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                <!-- Links -->
                                                            </td>
                                                            <td data-element="freya-footer-gap" data-label="Gap"
                                                                class="hide-mobile" calign="center">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="5"></td>
                                                                        <td class="center-text"
                                                                            data-text-style="Paragraphs" align="center"
                                                                            style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:500;font-style:normal;color:#666666;text-decoration:none;letter-spacing:0px;">
                                                                            |</td>
                                                                        <td width="5"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                            <td data-element="freya-footer-phone-number"
                                                                data-label="Phone number" class="rwd-on-mobile row"
                                                                align="center" valign="middle">
                                                                <!-- Links -->
                                                                <table border="0" cellspacing="0" cellpadding="0"
                                                                    class="center-float">
                                                                    <tr>
                                                                        <td align="center">
                                                                            <singleline>
                                                                                <a href="tel:+33-738-198-7926" mc:edit
                                                                                    data-button data-text-style="Links"
                                                                                    style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:500;font-style:normal;color:#000000;text-decoration:none;letter-spacing:0px;"><span>+234 702 5000 490</span></a>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                <!-- Links -->
                                                            </td>
                                                        </tr>
                                                    </table>

                                                </td>
                                            </tr>
                                        </table>
                                        <!-- rwd-col -->
                                    </td>
                                </tr>
                                <tr data-element="freya-footer-social-icons-contact"
                                    data-label="Social Icons & Contact">
                                    <td height="30" style="font-size:30px;line-height:30px;"
                                        data-height="Spacing under social icons & contact">&nbsp;</td>
                                </tr>
                                <tr data-element="freya-footer-copyrights-apps" data-label="Copyrights & Apps">
                                    <td height="20" style="font-size:20px;line-height:20px;"
                                        data-height="Spacing under copyrights & apps">&nbsp;</td>
                                </tr>
                            </table>

                            <table border="0" align="center" cellpadding="0" cellspacing="0" role="presentation"
                                width="100%" style="width:100%;max-width:100%;">
                                <tr data-element="freya-brand-colors" data-label="Brand Colors">
                                    <td align="center">
                                        <!-- Brand Colors -->
                                        <table border="0" align="center" cellpadding="0" cellspacing="0"
                                            role="presentation" width="100%" style="width:100%;max-width:100%;">
                                            <tr>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="1st Color"
                                                    bgcolor="#0C6B55" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="2nd Color"
                                                    bgcolor="#45B88F" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="3rd Color"
                                                    bgcolor="#A9DE90" style="width:33.33%;"></td>
                                            </tr>
                                        </table>
                                        <!-- Brand Colors -->
                                    </td>
                                </tr>
                                <tr data-element="freya-footer-tags" data-label="Footer Tags">
                                    <td align="center" bgcolor="#FFFFFF" data-bgcolor="Footer BgColor">

                                        <table data-inner-table border="0" align="center" cellpadding="0"
                                            cellspacing="0" role="presentation"
                                            class="inner-table row container-padding" width="580"
                                            style="width:580px;max-width:580px;">
                                            <tr>
                                                <td height="20" style="font-size:20px;line-height:20px;"
                                                    data-height="Spacing under brand colors">&nbsp;</td>
                                            </tr>
                                            <tr data-element="freya-footer-permission-reminder"
                                                data-label="Permission reminder">
                                                <td data-text-style="Paragraphs" align="left" class="center-text"
                                                    style="font-family:'Roboto',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:400;font-style:normal;color:#333333;text-decoration:none;letter-spacing:0px;">
                                                    <singleline>
                                                        <div mc:edit data-text-edit>
                                                            Copyright © 2023 Edike. All rights reserved | Powered by <br />
                                                            Competence Asset Management Company Limited.
                                                        </div>
                                                    </singleline>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td height="30" style="font-size:30px;line-height:30px;"
                                                    data-height="Spacing under tags">&nbsp;</td>
                                            </tr>
                                        </table>

                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    <tr class="hide-mobile">
                        <td height="30" style="font-size:30px;line-height:30px;" data-height="Spacing bottom">&nbsp;
                        </td>
                    </tr>
                    <!-- freya-footer -->
                </table>

            </td>
        </tr><!-- Outer-Table -->
    </table>

</body>

</html>
    `,
  };
  mg.messages().send(data, async function (error) {
    if (error) {
      return res.status(400).json({
        msg: error.message,
      });
    }
    return res.status(200).json({
      msg: "We've sent a 6-digit Activation Code to your Email Address",
      status: "valid",
    });
  });
};

const resendResetPasswordOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      msg: "Kindly Enter your Email Account with us",
      status: "invalid",
    });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      msg: "Invalid Email Credentials",
      status: "invalid",
    });
  }
  const otp = generateOTP();
  user.resetPasswordToken = otp;
  await user.save();

  // const data = {
  //   otp: otp,
  // };

  // // using send grid to send out emails
  // sendEmail.sendGridEmail(
  //   email, // recipient email
  //   "d-391a706b81c74ec9982aa50a41c90e9d", // template id
  //   "Reset Password Verification", // subject
  //   data
  // );

  // return res.status(200).json({
  //   msg: "We've sent a 6-digit Reset Code to your Email Address",
  //   status: "valid",
  // });

  const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN });
  const data = {
    from: `${process.env.EMAIL_FROM}`,
    to: email,
    subject: "Edike Reset Password Verification",
    html: `

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
    <!--[if (gte mso 9)|(IE)]>
  <xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
<![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- So that mobile will display zoomed in -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- enable media queries for windows phone 8 -->
    <meta name="format-detection" content="telephone=no"> <!-- disable auto telephone linking in iOS -->
    <meta name="format-detection" content="date=no"> <!-- disable auto date linking in iOS -->
    <meta name="format-detection" content="address=no"> <!-- disable auto address linking in iOS -->
    <meta name="format-detection" content="email=no"> <!-- disable auto email linking in iOS -->
    <meta name="color-scheme" content="only">
    <title></title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai+Looped:wght@100;200;300;400;500;600;700&family=Roboto:wght@100;300;400;500;700;900&display=swap"
        rel="stylesheet">

    <style type="text/css">
        /*Basics*/
        body {
            margin: 0px !important;
            padding: 0px !important;
            display: block !important;
            min-width: 100% !important;
            width: 100% !important;
            -webkit-text-size-adjust: none;
        }

        table {
            border-spacing: 0;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        table td {
            border-collapse: collapse;
            mso-line-height-rule: exactly;
        }

        td img {
            -ms-interpolation-mode: bicubic;
            width: auto;
            max-width: auto;
            height: auto;
            margin: auto;
            display: block !important;
            border: 0px;
        }

        td p {
            margin: 0;
            padding: 0;
        }

        td div {
            margin: 0;
            padding: 0;
        }

        td a {
            text-decoration: none;
            color: inherit;
        }

        /*Outlook*/
        .ExternalClass {
            width: 100%;
        }

        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
            line-height: inherit;
        }

        .ReadMsgBody {
            width: 100%;
            background-color: #ffffff;
        }

        /* iOS freya LINKS */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        /*Gmail freya links*/
        u+#body a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
        }

        /*Buttons fix*/
        .undoreset a,
        .undoreset a:hover {
            text-decoration: none !important;
        }

        .yshortcuts a {
            border-bottom: none !important;
        }

        .ios-footer a {
            color: #aaaaaa !important;
            text-decoration: none;
        }

        /* data-outer-table="800 - 600" */
        .outer-table {
            width: 640px !important;
            max-width: 640px !important;
        }

        /* data-inner-table="780 - 540" */
        .inner-table {
            width: 580px !important;
            max-width: 580px !important;
        }

        /*Responsive-Tablet*/
        @media only screen and (max-width: 799px) and (min-width: 601px) {
            .outer-table.row {
                width: 640px !important;
                max-width: 640px !important;
            }

            .inner-table.row {
                width: 580px !important;
                max-width: 580px !important;
            }
        }

        /*Responsive-Mobile*/
        @media only screen and (max-width: 600px) and (min-width: 320px) {
            table.row {
                width: 100% !important;
                max-width: 100% !important;
            }

            td.row {
                width: 100% !important;
                max-width: 100% !important;
            }

            .img-responsive img {
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                margin: auto;
            }

            .center-float {
                float: none !important;
                margin: auto !important;
            }

            .center-text {
                text-align: center !important;
            }

            .container-padding {
                width: 100% !important;
                padding-left: 15px !important;
                padding-right: 15px !important;
            }

            .container-padding10 {
                width: 100% !important;
                padding-left: 10px !important;
                padding-right: 10px !important;
            }

            .hide-mobile {
                display: none !important;
            }

            .menu-container {
                text-align: center !important;
            }

            .autoheight {
                height: auto !important;
            }

            .m-padding-10 {
                margin: 10px 0 !important;
            }

            .m-padding-15 {
                margin: 15px 0 !important;
            }

            .m-padding-20 {
                margin: 20px 0 !important;
            }

            .m-padding-30 {
                margin: 30px 0 !important;
            }

            .m-padding-40 {
                margin: 40px 0 !important;
            }

            .m-padding-50 {
                margin: 50px 0 !important;
            }

            .m-padding-60 {
                margin: 60px 0 !important;
            }

            .m-padding-top10 {
                margin: 30px 0 0 0 !important;
            }

            .m-padding-top15 {
                margin: 15px 0 0 0 !important;
            }

            .m-padding-top20 {
                margin: 20px 0 0 0 !important;
            }

            .m-padding-top30 {
                margin: 30px 0 0 0 !important;
            }

            .m-padding-top40 {
                margin: 40px 0 0 0 !important;
            }

            .m-padding-top50 {
                margin: 50px 0 0 0 !important;
            }

            .m-padding-top60 {
                margin: 60px 0 0 0 !important;
            }

            .m-height10 {
                font-size: 10px !important;
                line-height: 10px !important;
                height: 10px !important;
            }

            .m-height15 {
                font-size: 15px !important;
                line-height: 15px !important;
                height: 15px !important;
            }

            .m-height20 {
                font-size: 20px !important;
                line-height: 20px !important;
                height: 20px !important;
            }

            .m-height25 {
                font-size: 25px !important;
                line-height: 25px !important;
                height: 25px !important;
            }

            .m-height30 {
                font-size: 30px !important;
                line-height: 30px !important;
                height: 30px !important;
            }

            .radius6 {
                border-radius: 6px !important;
            }

            .fade-white {
                background-color: rgba(255, 255, 255, 0.8) !important;
            }

            .rwd-on-mobile {
                display: inline-block !important;
                padding: 5px !important;
            }

            .center-on-mobile {
                text-align: center !important;
            }

            .rwd-col {
                width: 100% !important;
                max-width: 100% !important;
                display: inline-block !important;
            }

            .type48 {
                font-size: 48px !important;
                line-height: 48px !important;
            }
        }
    </style>
    <style type="text/css" class="export-delete">
        .composer--mobile table.row {
            width: 100% !important;
            max-width: 100% !important;
        }

        .composer--mobile td.row {
            width: 100% !important;
            max-width: 100% !important;
        }

        .composer--mobile .img-responsive img {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            margin: auto;
        }

        .composer--mobile .center-float {
            float: none !important;
            margin: auto !important;
        }

        .composer--mobile .center-text {
            text-align: center !important;
        }

        .composer--mobile .container-padding {
            width: 100% !important;
            padding-left: 15px !important;
            padding-right: 15px !important;
        }

        .composer--mobile .container-padding10 {
            width: 100% !important;
            padding-left: 10px !important;
            padding-right: 10px !important;
        }

        .composer--mobile .hide-mobile {
            display: none !important;
        }

        .composer--mobile .menu-container {
            text-align: center !important;
        }

        .composer--mobile .autoheight {
            height: auto !important;
        }

        .composer--mobile .m-padding-10 {
            margin: 10px 0 !important;
        }

        .composer--mobile .m-padding-15 {
            margin: 15px 0 !important;
        }

        .composer--mobile .m-padding-20 {
            margin: 20px 0 !important;
        }

        .composer--mobile .m-padding-30 {
            margin: 30px 0 !important;
        }

        .composer--mobile .m-padding-40 {
            margin: 40px 0 !important;
        }

        .composer--mobile .m-padding-50 {
            margin: 50px 0 !important;
        }

        .composer--mobile .m-padding-60 {
            margin: 60px 0 !important;
        }

        .composer--mobile .m-padding-top10 {
            margin: 30px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top15 {
            margin: 15px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top20 {
            margin: 20px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top30 {
            margin: 30px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top40 {
            margin: 40px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top50 {
            margin: 50px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top60 {
            margin: 60px 0 0 0 !important;
        }

        .composer--mobile .m-height10 {
            font-size: 10px !important;
            line-height: 10px !important;
            height: 10px !important;
        }

        .composer--mobile .m-height15 {
            font-size: 15px !important;
            line-height: 15px !important;
            height: 15px !important;
        }

        .composer--mobile .m-height20 {
            font-srobotoize: 20px !important;
            line-height: 20px !important;
            height: 20px !important;
        }

        .composer--mobile .m-height25 {
            font-size: 25px !important;
            line-height: 25px !important;
            height: 25px !important;
        }

        .composer--mobile .m-height30 {
            font-size: 30px !important;
            line-height: 30px !important;
            height: 30px !important;
        }

        .composer--mobile .radius6 {
            border-radius: 6px !important;
        }

        .composer--mobile .fade-white {
            background-color: rgba(255, 255, 255, 0.8) !important;
        }

        .composer--mobile .rwd-on-mobile {
            display: inline-block !important;
            padding: 5px !important;
        }

        .composer--mobile .center-on-mobile {
            text-align: center !important;
        }

        .composer--mobile .rwd-col {
            width: 100% !important;
            max-width: 100% !important;
            display: inline-block !important;
        }

        .composer--mobile .type48 {
            font-size: 48px !important;
            line-height: 48px !important;
        }
    </style>
</head>

<body data-bgcolor="Body"
    style="margin-top: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;"
    bgcolor="#FAEEE7">

    <span class="preheader-text" data-preheader-text
        style="color: transparent; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; visibility: hidden; width: 0; display: none; mso-hide: all;"></span>

    <!-- Preheader white space hack -->
    <div style="display: none; max-height: 0px; overflow: hidden;">
        &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
    </div>

    <div data-primary-font="IBM Plex Sans Thai Looped" data-secondary-font="Roboto"
        style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;">
    </div>

    <table border="0" align="center" cellpadding="0" cellspacing="0" width="100%" style="width:100%;max-width:100%;">
        <tr><!-- Outer Table -->
            <td align="center" data-bgcolor="Body" bgcolor="#E6E5E5" data-composer>

                <table data-outer-table border="0" align="center" cellpadding="0" cellspacing="0"
                    class="outer-table row" role="presentation" width="640" style="width:640px;max-width:640px;"
                    data-module="freya-logo">
                    <!-- freya-logo -->
                    <tr>
                        <td align="center">

                            <!-- Content -->
                            <table border="0" align="center" cellpadding="0" cellspacing="0" role="presentation"
                                width="100%" style="width:100%;max-width:100%;">
                                <tr data-element="freya-brand-colors" data-label="Brand Colors">
                                    <td align="center">
                                        <!-- Brand Colors -->
                                        <table border="0" align="center" cellpadding="0" cellspacing="0"
                                            role="presentation" width="100%" style="width:100%;max-width:100%;">
                                            <tr>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="1st Color"
                                                    bgcolor="#0C6B55" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="2nd Color"
                                                    bgcolor="#45B88F" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="3rd Color"
                                                    bgcolor="#A9DE90" style="width:33.33%;"></td>
                                            </tr>
                                        </table>
                                        <!-- Brand Colors -->
                                    </td>
                                </tr>
                                <tr>
                                    <td height="40" style="font-size:40px;line-height:40px;" data-height="Spacing top">
                                        &nbsp;</td>
                                </tr>
                                <tr data-element="freya-logo" data-label="Logo">
                                    <td align="center">
                                        <table data-inner-table border="0" align="center" cellpadding="0"
                                            cellspacing="0" class="inner-table row container-padding"
                                            role="presentation" width="580" style="width:580px;max-width:580px;">
                                            <tr>
                                                <td align="left">
                                                    <img style="width:160px;border:0px;display: inline!important;"
                                                        src="https://res.cloudinary.com/edikeeduloan/image/upload/v1671800748/edike%20logo/flbvdxkotzjvmkhqfcn5.png"
                                                        width="160" border="0" editable="true" data-icon data-image-edit
                                                        data-url data-label="Logo" data-image-width alt="logo">
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <tr>
                                    <td height="10" style="font-size:10px;line-height:10px;"
                                        data-height="Spacing bottom">&nbsp;</td>
                                </tr>
                            </table>
                            <!-- Content -->

                        </td>
                    </tr>
                    <!-- freya-logo -->
                </table>

                <table data-outer-table border="0" align="center" cellpadding="0" cellspacing="0"
                    class="outer-table row container-padding" role="presentation" width="640"
                    style="width:640px;max-width:640px;" data-module="freya-header-1">
                    <!-- freya-header-1 -->
                    <tr>
                        <td align="center" bgcolor="#FFFFFF" data-bgcolor="BgColor" class="container-padding">

                            <table data-inner-table border="0" align="center" cellpadding="0" cellspacing="0"
                                role="presentation" class="inner-table row" width="580"
                                style="width:580px;max-width:580px;">
                                <tr>
                                    <td class="m-height15" height="30" style="font-size:30px;line-height:30px;"
                                        data-height="Spacing top">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <!-- content -->
                                        <table border="0" align="center" cellpadding="0" cellspacing="0"
                                            role="presentation" width="100%" style="width:100%;max-width:100%;">
                                            <tr data-element="freya-header-image" data-label="Header image">
                                                <td height="40" style="font-size:40px;line-height:40px;"
                                                    data-height="Spacing under image">&nbsp;</td>
                                            </tr>
                                            <tr data-element="freya-header-headline" data-label="Header Headlines">
                                                <td class="type48" data-text-style="Header Headlines" align="left"
                                                    style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:30px;line-height:64px;font-weight:300;font-style:normal;color:#325288;text-decoration:none;letter-spacing:0px;">
                                                    <singleline>
                                                        <div mc:edit data-text-edit>
                                                            <strong> Edike Reset Password Verification</strong>
                                                        </div>
                                                    </singleline>
                                                </td>
                                            </tr>
                                            
                                            <tr data-element="freya-header-paragraph" data-label="Header Paragraph">
                                                <td data-text-style="Header Paragraph" align="left"
                                                    style="font-family:'Roboto',Arial,Helvetica,sans-serif;font-size:18px;line-height:32px;font-weight:400;font-style:normal;color:#666666;text-decoration:none;letter-spacing:0px;">
                                                    <singleline>
                                                        <p  style="margin-top: 30px;">Enter OTP for Account Verification.</p>
                                                        <div mc:edit data-text-edit  style="margin-top: 5px;">
                                                          
                                                            Please use this verification code below to complete the process: 
                                                        </div>
                                                    </singleline>
                                                </td>
                                            </tr>
                                            
                                            <tr data-element="freya-header-paragraph" data-label="Header Paragraph">
                                                <td height="30" style="font-size:30px;line-height:30px;" data-height="Spacing under paragraph">&nbsp;</td>
                                            </tr>

                                            <tr data-element="freya-header-user-code" data-label="User code">
                                                <td align="center">
                                                    <!-- rwd-col -->
                                                    <table border="0" cellpadding="0" cellspacing="0" align="left"
                                                        role="presentation">
                                                        <tr>
                                                            <td class="rwd-col" align="center">

                                                                <table border="0" align="left" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td data-text-style="Text Style" align="left"
                                                                            style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:28px;line-height:38px;font-weight:400;font-style:normal;color:#666666;text-decoration:none;letter-spacing:0px;">
                                                                            <singleline>
                                                                                <div mc:edit data-text-edit>
                                                                                    OTP:
                                                                                </div>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>

                                                            </td>
                                                            <td class="rwd-col" align="center" width="10" height="5"
                                                                style="width:10px;max-width:10px;height:5px;">&nbsp;
                                                            </td>
                                                            <td class="rwd-col" align="center">

                                                                <table border="0" align="left" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td data-text-style="Coupon Code Style"
                                                                            align="left"
                                                                            style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:28px;line-height:38px;font-weight:700;font-style:normal;color:#D96098;text-decoration:none;letter-spacing:0px;">
                                                                            <singleline>
                                                                                <div mc:edit data-text-edit>
                                                                                    ${otp}
                                                                                </div>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>

                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <!-- rwd-col -->
                                                </td>
                                            </tr>
                                            <tr data-element="freya-header-paragraph" data-label="Header Paragraph">
                                                <td height="40" style="font-size:40px;line-height:40px;"
                                                    data-height="Spacing under paragraph">&nbsp;</td>
                                            </tr>
                                            
                                        </table>
                                        <!-- content -->
                                    </td>
                                </tr>
                                <tr>
                                    <td class="m-height15" height="30" style="font-size:30px;line-height:30px;"
                                        data-height="Spacing bottom">&nbsp;</td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <table border="0" align="center" cellpadding="0" cellspacing="0" role="presentation"
                                width="90.63%" style="width:90.63%;max-width:90.63%;">
                                <tr>
                                    <td height="5" style="font-size:5px;line-height:5px;" bgcolor="#DDD2CC"
                                        data-bgcolor="Shadow Color">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- freya-header-1 -->
                </table>

                <table data-outer-table border="0" align="center" cellpadding="0" cellspacing="0"
                    class="outer-table row" role="presentation" width="640" style="width:640px;max-width:640px;"
                    data-module="freya-footer">
                    <!-- freya-footer -->
                    <tr>
                        <td align="center">

                            <table data-inner-table border="0" align="center" cellpadding="0" cellspacing="0"
                                role="presentation" class="inner-table row container-padding" width="580"
                                style="width:580px;max-width:580px;">
                                <tr>
                                    <td height="100" style="font-size:120px;line-height:120px;"
                                        data-height="Spacing top">&nbsp;</td>
                                </tr>
                                <tr data-element="freya-footer-social-icons-contact"
                                    data-label="Social Icons & Contact">
                                    <td align="center">
                                        <!-- rwd-col -->
                                        <table border="0" cellpadding="0" cellspacing="0" align="center"
                                            role="presentation" class="container-padding" width="100%"
                                            style="width:100%;max-width:100%;">
                                            <tr>
                                                <td class="rwd-col" align="center" width="41.38%"
                                                    style="width:41.38%;max-width:41.38%;">

                                                    <table border="0" align="left" cellpadding="0" cellspacing="0"
                                                        role="presentation" align="left" class="center-float">
                                                        <tr class="center-on-mobile">
                                                            <td data-element="freya-footer-facebook"
                                                                data-label="Facebook" align="left" valign="middle">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td align="center">
                                                                            <img style="width:24px;border:0px;display: inline!important;"
                                                                                src="https://i.ibb.co/xYhpJGq/facebook.png" width="24"
                                                                                border="0" editable="true" data-icon
                                                                                data-image-edit data-url
                                                                                data-label="Facebook" data-image-width
                                                                                alt="Facebook">
                                                                        </td>
                                                                        <td width="6"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                            <td data-element="freya-footer-twitter" data-label="Twitter"
                                                                align="center" valign="middle">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="6"></td>
                                                                        <td align="center">
                                                                            <img style="width:24px;border:0px;display: inline!important;"
                                                                                src="https://i.ibb.co/ZhkxYSZ/twitter.png" width="24"
                                                                                border="0" editable="true" data-icon
                                                                                data-image-edit data-url
                                                                                data-label="Twitter" data-image-width
                                                                                alt="Twitter">
                                                                        </td>
                                                                        <td width="6"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>

                                                            
                                                            <td data-element="freya-footer-instagram"
                                                                data-label="Instagram" align="center" valign="middle">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="6"></td>
                                                                        <td align="center">
                                                                            <img style="width:24px;border:0px;display: inline!important;"
                                                                                src="https://i.ibb.co/7rcjfBC/instagram.png" width="24"
                                                                                border="0" editable="true" data-icon
                                                                                data-image-edit data-url
                                                                                data-label="Instagram" data-image-width
                                                                                alt="Instagram">
                                                                        </td>
                                                                        <td width="6"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                </td>
                                                <td class="rwd-col" align="center" width="1.62%" height="20"
                                                    style="width:1.62%;max-width:1.62%;height:20px;">&nbsp;</td>
                                                <td class="rwd-col" align="center" width="57%"
                                                    style="width:57%;max-width:57%;">

                                                    <table border="0" cellpadding="0" cellspacing="0" align="right"
                                                        role="presentation" class="center-float">
                                                        <tr class="center-on-mobile">
                                                            <td data-element="freya-footer-email" data-label="Email"
                                                                class="rwd-on-mobile row" align="center"
                                                                valign="middle">
                                                                <!-- Links -->
                                                                <table border="0" cellspacing="0" cellpadding="0"
                                                                    class="center-float">
                                                                    <tr>
                                                                        <td align="center">
                                                                            <singleline>
                                                                                <a href="mailto:info@edike.info" mc:edit
                                                                                    data-button data-text-style="Links"
                                                                                    style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:500;font-style:normal;color:#000000;text-decoration:none;letter-spacing:0px;"><span>info@edike.info</span></a>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                <!-- Links -->
                                                            </td>
                                                            <td data-element="freya-footer-gap" data-label="Gap"
                                                                class="hide-mobile" calign="center">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="5"></td>
                                                                        <td class="center-text"
                                                                            data-text-style="Paragraphs" align="center"
                                                                            style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:500;font-style:normal;color:#666666;text-decoration:none;letter-spacing:0px;">
                                                                            |</td>
                                                                        <td width="5"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                            <td data-element="freya-footer-phone-number"
                                                                data-label="Phone number" class="rwd-on-mobile row"
                                                                align="center" valign="middle">
                                                                <!-- Links -->
                                                                <table border="0" cellspacing="0" cellpadding="0"
                                                                    class="center-float">
                                                                    <tr>
                                                                        <td align="center">
                                                                            <singleline>
                                                                                <a href="tel:+33-738-198-7926" mc:edit
                                                                                    data-button data-text-style="Links"
                                                                                    style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:500;font-style:normal;color:#000000;text-decoration:none;letter-spacing:0px;"><span>+234 702 5000 490</span></a>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                <!-- Links -->
                                                            </td>
                                                        </tr>
                                                    </table>

                                                </td>
                                            </tr>
                                        </table>
                                        <!-- rwd-col -->
                                    </td>
                                </tr>
                                <tr data-element="freya-footer-social-icons-contact"
                                    data-label="Social Icons & Contact">
                                    <td height="30" style="font-size:30px;line-height:30px;"
                                        data-height="Spacing under social icons & contact">&nbsp;</td>
                                </tr>
                                <tr data-element="freya-footer-copyrights-apps" data-label="Copyrights & Apps">
                                    <td height="20" style="font-size:20px;line-height:20px;"
                                        data-height="Spacing under copyrights & apps">&nbsp;</td>
                                </tr>
                            </table>

                            <table border="0" align="center" cellpadding="0" cellspacing="0" role="presentation"
                                width="100%" style="width:100%;max-width:100%;">
                                <tr data-element="freya-brand-colors" data-label="Brand Colors">
                                    <td align="center">
                                        <!-- Brand Colors -->
                                        <table border="0" align="center" cellpadding="0" cellspacing="0"
                                            role="presentation" width="100%" style="width:100%;max-width:100%;">
                                            <tr>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="1st Color"
                                                    bgcolor="#0C6B55" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="2nd Color"
                                                    bgcolor="#45B88F" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="3rd Color"
                                                    bgcolor="#A9DE90" style="width:33.33%;"></td>
                                            </tr>
                                        </table>
                                        <!-- Brand Colors -->
                                    </td>
                                </tr>
                                <tr data-element="freya-footer-tags" data-label="Footer Tags">
                                    <td align="center" bgcolor="#FFFFFF" data-bgcolor="Footer BgColor">

                                        <table data-inner-table border="0" align="center" cellpadding="0"
                                            cellspacing="0" role="presentation"
                                            class="inner-table row container-padding" width="580"
                                            style="width:580px;max-width:580px;">
                                            <tr>
                                                <td height="20" style="font-size:20px;line-height:20px;"
                                                    data-height="Spacing under brand colors">&nbsp;</td>
                                            </tr>
                                            <tr data-element="freya-footer-permission-reminder"
                                                data-label="Permission reminder">
                                                <td data-text-style="Paragraphs" align="left" class="center-text"
                                                    style="font-family:'Roboto',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:400;font-style:normal;color:#333333;text-decoration:none;letter-spacing:0px;">
                                                    <singleline>
                                                        <div mc:edit data-text-edit>
                                                            Copyright © 2023 Edike. All rights reserved | Powered by <br />
                                                            Competence Asset Management Company Limited.
                                                        </div>
                                                    </singleline>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td height="30" style="font-size:30px;line-height:30px;"
                                                    data-height="Spacing under tags">&nbsp;</td>
                                            </tr>
                                        </table>

                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    <tr class="hide-mobile">
                        <td height="30" style="font-size:30px;line-height:30px;" data-height="Spacing bottom">&nbsp;
                        </td>
                    </tr>
                    <!-- freya-footer -->
                </table>

            </td>
        </tr><!-- Outer-Table -->
    </table>

</body>

</html>

    `,
  };
  mg.messages().send(data, async function (error) {
    if (error) {
      return res.status(400).json({
        msg: error.message,
      });
    }

    return res.status(200).json({
      msg: "We've sent a 6-digit Activation Code to your Email Address",
      status: "valid",
    });
  });
};

const loginEmail = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      msg: "Enter Email and Password",
      status: "invalid",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      msg: "Invalid Email Credentials",
      status: "invalid",
    });
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return res.status(400).json({
      msg: "Invalid Password Credentials",
      status: "invalid",
    });
  }

  if (user.isAccountVerified === "pending") {
    return res.status(400).json({
      msg: "Kindly Verify your Account, Check Your Mail",
      status: "invalid",
    });
  }

  const useful = await User.find({ email }).select("-password");
  const payload = {
    user: {
      id: user._id,
    },
  };
  const token = jwt.sign(payload, process.env.JWTSECRET, {
    expiresIn: process.env.JWTLIFETIME,
  });

  return res.status(StatusCodes.OK).json({
    useful,
    token,
  });
};

const loadUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.status(StatusCodes.OK).json(user);
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Server Error",
      status: "invalid",
    });
  }
};

const verifyNIN = async (req, res) => {
  const { nin } = req.body;
  const profileImage = req.file;

  if (!nin) {
    return res.status(400).json({
      msg: "Enter Nigerian Identification Number",
      status: "invalid",
    });
  }
  if (!profileImage) {
    return res.status(400).json({
      msg: "Please Provide an Image",
      status: "invalid",
    });
  }
  if (nin.length !== 11) {
    return res.status(400).json({
      msg: "Incomplete NIN Number",
      status: "invalid",
    });
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_APISECRET,
  });

  const result = await cloudinary.uploader.upload(profileImage.path, {
    public_id: `${Date.now()}`,
    resource_type: "auto",
    folder: "Edike User Profile Image-NIN",
  });

  const buff = await convertBase(result.secure_url);

  const options = {
    method: "POST",
    url: "https://api.dojah.io/api/v1/kyc/nin/verify",
    headers: {
      Appid: `${process.env.DOJAH_APP_ID}`,
      "Content-type": "application/json",
      Authorization: `${process.env.DOJAH_API_KEY}`,
    },
    body: { nin: nin, selfie_image: buff },
    json: true,
  };

  request(options, async function (response, body) {
    if (body.statusCode === 400) {
      cloudinary.uploader.destroy(`${result.public_id}`);
      return res.status(400).json({
        response,
        msg: "Invalid image uploaded for selfie_image",
        status: "invalid",
      });
    }
    if (response) {
      cloudinary.uploader.destroy(`${result.public_id}`);
      return res.status(400).json({
        response,
        body,
        msg: "NIN Verification Service Unavailable, Please Use BVN to Continue Verification",
        status: "invalid",
      });
    }

    const user = await User.findById({ _id: req.user.id });
    if (!user) {
      cloudinary.uploader.destroy(`${result.public_id}`);
      return res.status(400).json({
        msg: "Not Authorized",
        status: "invalid",
      });
    }

    user.firstname = body.body.entity.firstname;
    user.lastname = body.body.entity.surname;
    user.middlename = body.body.entity.middlename;
    user.birthdate = body.body.entity.birthdate;
    user.phoneNumber1 = body.body.entity.telephoneno;
    user.gender = body.body.entity.gender;
    user.self_origin_state = body.body.entity.state;
    user.self_origin_lga = body.body.entity.residence_lga;
    user.self_origin_place = body.body.entity.place;
    user.nin = body.body.entity.nin;
    user.isnin = "approved";
    user.residence_address = body.body.entity.residence_AddressLine1;
    user.religion = body.body.entity.religion;
    user.nationality = body.body.entity.nationality;
    user.nok_firstname = body.body.entity.nok_firstname;
    user.nok_lastname = body.body.entity.nok_lastname;
    user.nok_middename = body.body.entity.nok_middlename;
    user.nok_address = body.body.entity.nok_address1;
    user.nok_lga = body.body.entity.nok_lga;
    user.nok_state = body.body.entity.nok_state;
    user.nok_town = body.body.entity.nok_town;
    user.maidenname = body.body.entity.maidenname;

    await user.save();

    return res.status(200).json({
      msg: "NIN Verification Successful",
      status: "valid",
    });
  });
};

const verifyBVN = async (req, res) => {
  const { bvn } = req.body;
  const profileImage = req.file;

  if (!bvn) {
    return res.status(400).json({
      msg: "Enter Bank Verification Number",
      status: "invalid",
    });
  }
  if (!profileImage) {
    return res.status(400).json({
      msg: "Please Provide an Image",
      status: "invalid",
    });
  }
  if (bvn.length !== 11) {
    return res.status(400).json({
      msg: "Incomplete BVN Number",
      status: "invalid",
    });
  }

  const result = await cloudinary.uploader.upload(profileImage.path, {
    public_id: `${Date.now()}`,
    resource_type: "auto",
    folder: "Edike User Profile Image-BVN",
  });

  const buff = await convertBase(result.secure_url);

  const options = {
    method: "POST",
    url: "https://api.dojah.io/api/v1/kyc/bvn/verify",
    headers: {
      Appid: `${process.env.DOJAH_APP_ID}`,
      "Content-type": "application/json",
      Authorization: `${process.env.DOJAH_API_KEY}`,
    },
    body: { bvn: bvn, selfie_image: buff },
    json: true,
  };

  request(options, async function (response, body) {
    if (body.statusCode === 400) {
      cloudinary.uploader.destroy(`${result.public_id}`);
      return res.status(400).json({
        response,
        msg: "Invalid image uploaded for selfie_image",
        status: "invalid",
      });
    }
    if (response) {
      cloudinary.uploader.destroy(`${result.public_id}`);
      return res.status(400).json({
        response,
        body,
        msg: "BVN Verification Service Unavailable, Please Use NIN to Continue Verification",
        status: "invalid",
      });
    }

    const user = await User.findById({ _id: req.user.id });
    if (!user) {
      cloudinary.uploader.destroy(`${result.public_id}`);
      return res.status(400).json({
        msg: "Not Authorized",
        status: "invalid",
      });
    }

    user.firstname = body.body.entity.first_name;
    user.lastname = body.body.entity.last_name;
    !user.middlename
      ? (user.middlename = body.body.entity.middle_name)
      : user.middlename;
    !user.birthdate
      ? (user.birthdate = body.body.entity.date_of_birth)
      : user.birthdate;
    !user.phoneNumber1
      ? (user.phoneNumber1 = body.body.entity.phone_number1)
      : user.phoneNumber1;
    !user.phoneNumber2
      ? (user.phoneNumber2 = body.body.entity.phone_number2)
      : user.phoneNumber2;
    !user.gender ? (user.gender = body.body.entity.gender) : user.gender;
    !user.self_origin_state
      ? (user.self_origin_state = body.body.entity.state_of_origin)
      : user.self_origin_state;
    !user.self_origin_lga
      ? (user.self_origin_lga = body.body.entity.lga_of_origin)
      : user.self_origin_lga;
    !user.self_origin_place
      ? (user.self_origin_place = body.body.entity.lga_of_residence)
      : user.self_origin_place;
    !user.nin ? (user.nin = body.body.entity.nin) : user.nin;
    user.isbvn === "pending"
      ? (user.isbvn = "approved")
      : user.isbvn === "pending";
    !user.bvn ? (user.bvn = body.body.entity.bvn) : user.bvn;
    !user.profileImage
      ? (user.profileImage = result.secure_url)
      : user.profileImage;
    !user.publicID ? (user.publicID = result.public_id) : user.publicID;
    !user.residence_address
      ? (user.residence_address = body.body.entity.residential_address)
      : user.residence_address;
    !user.marital_status
      ? (user.marital_status = body.body.entity.marital_status)
      : user.marital_status;

    await user.save();

    return res.status(200).json({
      msg: "BVN Verification Successful",
      status: "valid",
    });
  });
};

const activateAccount = async (req, res) => {
  const { otpToken } = req.body;
  if (!otpToken) {
    return res.status(400).json({
      msg: "Enter Otp Code",
      status: "invalid",
    });
  }

  User.findOne({
    otpToken: req.body.otpToken,
  }).then((user) => {
    if (!user)
      return res
        .status(401)
        .json({ msg: "Invalid OTP Veification", status: "invalid" });

    user.otpToken = undefined;
    user.isAccountVerified = "approved";

    // Save
    user.save((err) => {
      if (err)
        return res.status(500).json({ msg: err.message, status: "invalid" });

      const payload = {
        user: {
          id: user._id,
        },
      };

      const token = jwt.sign(payload, process.env.JWTSECRET, {
        expiresIn: process.env.JWTLIFETIME,
      });

      return res.status(200).json({
        msg: "Verification Successful",
        status: "valid",
        token,
      });
    });
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      msg: "Enter Email Address",
      status: "invalid",
    });
  }
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user)
        return res.status(401).json({
          msg: "Invalid Email Address",
          status: "invalid",
        });

      const otp = generateOTP();
      user.resetPasswordToken = otp;
      user
        .save()
        .then((user) => {
          // const data = {
          //   otp: otp,
          // };

          // // using send grid to send out emails
          // sendEmail.sendGridEmail(
          //   email, // recipient email
          //   "d-7efe659fc4264d61a3f462826bd3db71", // template id
          //   "Reset Password OTP Verification", // subject
          //   data
          // );

          // return res.status(200).json({
          //   msg: "We've sent a 6-digit Activation Code to your Email Address",
          //   status: "valid",
          // });

          const mg = mailgun({
            apiKey: process.env.MAILGUN_API_KEY,
            domain: DOMAIN,
          });
          const data = {
            from: `${process.env.EMAIL_FROM}`,
            to: email,
            subject: "Edike Reset Password Verification",
            html: `

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
    <!--[if (gte mso 9)|(IE)]>
  <xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
<![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- So that mobile will display zoomed in -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- enable media queries for windows phone 8 -->
    <meta name="format-detection" content="telephone=no"> <!-- disable auto telephone linking in iOS -->
    <meta name="format-detection" content="date=no"> <!-- disable auto date linking in iOS -->
    <meta name="format-detection" content="address=no"> <!-- disable auto address linking in iOS -->
    <meta name="format-detection" content="email=no"> <!-- disable auto email linking in iOS -->
    <meta name="color-scheme" content="only">
    <title></title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai+Looped:wght@100;200;300;400;500;600;700&family=Roboto:wght@100;300;400;500;700;900&display=swap"
        rel="stylesheet">

    <style type="text/css">
        /*Basics*/
        body {
            margin: 0px !important;
            padding: 0px !important;
            display: block !important;
            min-width: 100% !important;
            width: 100% !important;
            -webkit-text-size-adjust: none;
        }

        table {
            border-spacing: 0;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        table td {
            border-collapse: collapse;
            mso-line-height-rule: exactly;
        }

        td img {
            -ms-interpolation-mode: bicubic;
            width: auto;
            max-width: auto;
            height: auto;
            margin: auto;
            display: block !important;
            border: 0px;
        }

        td p {
            margin: 0;
            padding: 0;
        }

        td div {
            margin: 0;
            padding: 0;
        }

        td a {
            text-decoration: none;
            color: inherit;
        }

        /*Outlook*/
        .ExternalClass {
            width: 100%;
        }

        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
            line-height: inherit;
        }

        .ReadMsgBody {
            width: 100%;
            background-color: #ffffff;
        }

        /* iOS freya LINKS */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        /*Gmail freya links*/
        u+#body a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
        }

        /*Buttons fix*/
        .undoreset a,
        .undoreset a:hover {
            text-decoration: none !important;
        }

        .yshortcuts a {
            border-bottom: none !important;
        }

        .ios-footer a {
            color: #aaaaaa !important;
            text-decoration: none;
        }

        /* data-outer-table="800 - 600" */
        .outer-table {
            width: 640px !important;
            max-width: 640px !important;
        }

        /* data-inner-table="780 - 540" */
        .inner-table {
            width: 580px !important;
            max-width: 580px !important;
        }

        /*Responsive-Tablet*/
        @media only screen and (max-width: 799px) and (min-width: 601px) {
            .outer-table.row {
                width: 640px !important;
                max-width: 640px !important;
            }

            .inner-table.row {
                width: 580px !important;
                max-width: 580px !important;
            }
        }

        /*Responsive-Mobile*/
        @media only screen and (max-width: 600px) and (min-width: 320px) {
            table.row {
                width: 100% !important;
                max-width: 100% !important;
            }

            td.row {
                width: 100% !important;
                max-width: 100% !important;
            }

            .img-responsive img {
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                margin: auto;
            }

            .center-float {
                float: none !important;
                margin: auto !important;
            }

            .center-text {
                text-align: center !important;
            }

            .container-padding {
                width: 100% !important;
                padding-left: 15px !important;
                padding-right: 15px !important;
            }

            .container-padding10 {
                width: 100% !important;
                padding-left: 10px !important;
                padding-right: 10px !important;
            }

            .hide-mobile {
                display: none !important;
            }

            .menu-container {
                text-align: center !important;
            }

            .autoheight {
                height: auto !important;
            }

            .m-padding-10 {
                margin: 10px 0 !important;
            }

            .m-padding-15 {
                margin: 15px 0 !important;
            }

            .m-padding-20 {
                margin: 20px 0 !important;
            }

            .m-padding-30 {
                margin: 30px 0 !important;
            }

            .m-padding-40 {
                margin: 40px 0 !important;
            }

            .m-padding-50 {
                margin: 50px 0 !important;
            }

            .m-padding-60 {
                margin: 60px 0 !important;
            }

            .m-padding-top10 {
                margin: 30px 0 0 0 !important;
            }

            .m-padding-top15 {
                margin: 15px 0 0 0 !important;
            }

            .m-padding-top20 {
                margin: 20px 0 0 0 !important;
            }

            .m-padding-top30 {
                margin: 30px 0 0 0 !important;
            }

            .m-padding-top40 {
                margin: 40px 0 0 0 !important;
            }

            .m-padding-top50 {
                margin: 50px 0 0 0 !important;
            }

            .m-padding-top60 {
                margin: 60px 0 0 0 !important;
            }

            .m-height10 {
                font-size: 10px !important;
                line-height: 10px !important;
                height: 10px !important;
            }

            .m-height15 {
                font-size: 15px !important;
                line-height: 15px !important;
                height: 15px !important;
            }

            .m-height20 {
                font-size: 20px !important;
                line-height: 20px !important;
                height: 20px !important;
            }

            .m-height25 {
                font-size: 25px !important;
                line-height: 25px !important;
                height: 25px !important;
            }

            .m-height30 {
                font-size: 30px !important;
                line-height: 30px !important;
                height: 30px !important;
            }

            .radius6 {
                border-radius: 6px !important;
            }

            .fade-white {
                background-color: rgba(255, 255, 255, 0.8) !important;
            }

            .rwd-on-mobile {
                display: inline-block !important;
                padding: 5px !important;
            }

            .center-on-mobile {
                text-align: center !important;
            }

            .rwd-col {
                width: 100% !important;
                max-width: 100% !important;
                display: inline-block !important;
            }

            .type48 {
                font-size: 48px !important;
                line-height: 48px !important;
            }
        }
    </style>
    <style type="text/css" class="export-delete">
        .composer--mobile table.row {
            width: 100% !important;
            max-width: 100% !important;
        }

        .composer--mobile td.row {
            width: 100% !important;
            max-width: 100% !important;
        }

        .composer--mobile .img-responsive img {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            margin: auto;
        }

        .composer--mobile .center-float {
            float: none !important;
            margin: auto !important;
        }

        .composer--mobile .center-text {
            text-align: center !important;
        }

        .composer--mobile .container-padding {
            width: 100% !important;
            padding-left: 15px !important;
            padding-right: 15px !important;
        }

        .composer--mobile .container-padding10 {
            width: 100% !important;
            padding-left: 10px !important;
            padding-right: 10px !important;
        }

        .composer--mobile .hide-mobile {
            display: none !important;
        }

        .composer--mobile .menu-container {
            text-align: center !important;
        }

        .composer--mobile .autoheight {
            height: auto !important;
        }

        .composer--mobile .m-padding-10 {
            margin: 10px 0 !important;
        }

        .composer--mobile .m-padding-15 {
            margin: 15px 0 !important;
        }

        .composer--mobile .m-padding-20 {
            margin: 20px 0 !important;
        }

        .composer--mobile .m-padding-30 {
            margin: 30px 0 !important;
        }

        .composer--mobile .m-padding-40 {
            margin: 40px 0 !important;
        }

        .composer--mobile .m-padding-50 {
            margin: 50px 0 !important;
        }

        .composer--mobile .m-padding-60 {
            margin: 60px 0 !important;
        }

        .composer--mobile .m-padding-top10 {
            margin: 30px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top15 {
            margin: 15px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top20 {
            margin: 20px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top30 {
            margin: 30px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top40 {
            margin: 40px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top50 {
            margin: 50px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top60 {
            margin: 60px 0 0 0 !important;
        }

        .composer--mobile .m-height10 {
            font-size: 10px !important;
            line-height: 10px !important;
            height: 10px !important;
        }

        .composer--mobile .m-height15 {
            font-size: 15px !important;
            line-height: 15px !important;
            height: 15px !important;
        }

        .composer--mobile .m-height20 {
            font-srobotoize: 20px !important;
            line-height: 20px !important;
            height: 20px !important;
        }

        .composer--mobile .m-height25 {
            font-size: 25px !important;
            line-height: 25px !important;
            height: 25px !important;
        }

        .composer--mobile .m-height30 {
            font-size: 30px !important;
            line-height: 30px !important;
            height: 30px !important;
        }

        .composer--mobile .radius6 {
            border-radius: 6px !important;
        }

        .composer--mobile .fade-white {
            background-color: rgba(255, 255, 255, 0.8) !important;
        }

        .composer--mobile .rwd-on-mobile {
            display: inline-block !important;
            padding: 5px !important;
        }

        .composer--mobile .center-on-mobile {
            text-align: center !important;
        }

        .composer--mobile .rwd-col {
            width: 100% !important;
            max-width: 100% !important;
            display: inline-block !important;
        }

        .composer--mobile .type48 {
            font-size: 48px !important;
            line-height: 48px !important;
        }
    </style>
</head>

<body data-bgcolor="Body"
    style="margin-top: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;"
    bgcolor="#FAEEE7">

    <span class="preheader-text" data-preheader-text
        style="color: transparent; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; visibility: hidden; width: 0; display: none; mso-hide: all;"></span>

    <!-- Preheader white space hack -->
    <div style="display: none; max-height: 0px; overflow: hidden;">
        &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
    </div>

    <div data-primary-font="IBM Plex Sans Thai Looped" data-secondary-font="Roboto"
        style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;">
    </div>

    <table border="0" align="center" cellpadding="0" cellspacing="0" width="100%" style="width:100%;max-width:100%;">
        <tr><!-- Outer Table -->
            <td align="center" data-bgcolor="Body" bgcolor="#E6E5E5" data-composer>

                <table data-outer-table border="0" align="center" cellpadding="0" cellspacing="0"
                    class="outer-table row" role="presentation" width="640" style="width:640px;max-width:640px;"
                    data-module="freya-logo">
                    <!-- freya-logo -->
                    <tr>
                        <td align="center">

                            <!-- Content -->
                            <table border="0" align="center" cellpadding="0" cellspacing="0" role="presentation"
                                width="100%" style="width:100%;max-width:100%;">
                                <tr data-element="freya-brand-colors" data-label="Brand Colors">
                                    <td align="center">
                                        <!-- Brand Colors -->
                                        <table border="0" align="center" cellpadding="0" cellspacing="0"
                                            role="presentation" width="100%" style="width:100%;max-width:100%;">
                                            <tr>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="1st Color"
                                                    bgcolor="#0C6B55" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="2nd Color"
                                                    bgcolor="#45B88F" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="3rd Color"
                                                    bgcolor="#A9DE90" style="width:33.33%;"></td>
                                            </tr>
                                        </table>
                                        <!-- Brand Colors -->
                                    </td>
                                </tr>
                                <tr>
                                    <td height="40" style="font-size:40px;line-height:40px;" data-height="Spacing top">
                                        &nbsp;</td>
                                </tr>
                                <tr data-element="freya-logo" data-label="Logo">
                                    <td align="center">
                                        <table data-inner-table border="0" align="center" cellpadding="0"
                                            cellspacing="0" class="inner-table row container-padding"
                                            role="presentation" width="580" style="width:580px;max-width:580px;">
                                            <tr>
                                                <td align="left">
                                                    <img style="width:160px;border:0px;display: inline!important;"
                                                        src="https://res.cloudinary.com/edikeeduloan/image/upload/v1671800748/edike%20logo/flbvdxkotzjvmkhqfcn5.png"
                                                        width="160" border="0" editable="true" data-icon data-image-edit
                                                        data-url data-label="Logo" data-image-width alt="logo">
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <tr>
                                    <td height="10" style="font-size:10px;line-height:10px;"
                                        data-height="Spacing bottom">&nbsp;</td>
                                </tr>
                            </table>
                            <!-- Content -->

                        </td>
                    </tr>
                    <!-- freya-logo -->
                </table>

                <table data-outer-table border="0" align="center" cellpadding="0" cellspacing="0"
                    class="outer-table row container-padding" role="presentation" width="640"
                    style="width:640px;max-width:640px;" data-module="freya-header-1">
                    <!-- freya-header-1 -->
                    <tr>
                        <td align="center" bgcolor="#FFFFFF" data-bgcolor="BgColor" class="container-padding">

                            <table data-inner-table border="0" align="center" cellpadding="0" cellspacing="0"
                                role="presentation" class="inner-table row" width="580"
                                style="width:580px;max-width:580px;">
                                <tr>
                                    <td class="m-height15" height="30" style="font-size:30px;line-height:30px;"
                                        data-height="Spacing top">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <!-- content -->
                                        <table border="0" align="center" cellpadding="0" cellspacing="0"
                                            role="presentation" width="100%" style="width:100%;max-width:100%;">
                                            <tr data-element="freya-header-image" data-label="Header image">
                                                <td height="40" style="font-size:40px;line-height:40px;"
                                                    data-height="Spacing under image">&nbsp;</td>
                                            </tr>
                                            <tr data-element="freya-header-headline" data-label="Header Headlines">
                                                <td class="type48" data-text-style="Header Headlines" align="left"
                                                    style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:30px;line-height:64px;font-weight:300;font-style:normal;color:#325288;text-decoration:none;letter-spacing:0px;">
                                                    <singleline>
                                                        <div mc:edit data-text-edit>
                                                            <strong> Edike Reset Password Verification</strong>
                                                        </div>
                                                    </singleline>
                                                </td>
                                            </tr>
                                            
                                            <tr data-element="freya-header-paragraph" data-label="Header Paragraph">
                                                <td data-text-style="Header Paragraph" align="left"
                                                    style="font-family:'Roboto',Arial,Helvetica,sans-serif;font-size:18px;line-height:32px;font-weight:400;font-style:normal;color:#666666;text-decoration:none;letter-spacing:0px;">
                                                    <singleline>
                                                        <p  style="margin-top: 30px;">Enter OTP for Account Verification.</p>
                                                        <div mc:edit data-text-edit  style="margin-top: 5px;">
                                                          
                                                            Please use this verification code below to complete the process: 
                                                        </div>
                                                    </singleline>
                                                </td>
                                            </tr>
                                            
                                            <tr data-element="freya-header-paragraph" data-label="Header Paragraph">
                                                <td height="30" style="font-size:30px;line-height:30px;" data-height="Spacing under paragraph">&nbsp;</td>
                                            </tr>

                                            <tr data-element="freya-header-user-code" data-label="User code">
                                                <td align="center">
                                                    <!-- rwd-col -->
                                                    <table border="0" cellpadding="0" cellspacing="0" align="left"
                                                        role="presentation">
                                                        <tr>
                                                            <td class="rwd-col" align="center">

                                                                <table border="0" align="left" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td data-text-style="Text Style" align="left"
                                                                            style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:28px;line-height:38px;font-weight:400;font-style:normal;color:#666666;text-decoration:none;letter-spacing:0px;">
                                                                            <singleline>
                                                                                <div mc:edit data-text-edit>
                                                                                    OTP:
                                                                                </div>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>

                                                            </td>
                                                            <td class="rwd-col" align="center" width="10" height="5"
                                                                style="width:10px;max-width:10px;height:5px;">&nbsp;
                                                            </td>
                                                            <td class="rwd-col" align="center">

                                                                <table border="0" align="left" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td data-text-style="Coupon Code Style"
                                                                            align="left"
                                                                            style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:28px;line-height:38px;font-weight:700;font-style:normal;color:#D96098;text-decoration:none;letter-spacing:0px;">
                                                                            <singleline>
                                                                                <div mc:edit data-text-edit>
                                                                                    ${otp}
                                                                                </div>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>

                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <!-- rwd-col -->
                                                </td>
                                            </tr>
                                            <tr data-element="freya-header-paragraph" data-label="Header Paragraph">
                                                <td height="40" style="font-size:40px;line-height:40px;"
                                                    data-height="Spacing under paragraph">&nbsp;</td>
                                            </tr>
                                            
                                        </table>
                                        <!-- content -->
                                    </td>
                                </tr>
                                <tr>
                                    <td class="m-height15" height="30" style="font-size:30px;line-height:30px;"
                                        data-height="Spacing bottom">&nbsp;</td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <table border="0" align="center" cellpadding="0" cellspacing="0" role="presentation"
                                width="90.63%" style="width:90.63%;max-width:90.63%;">
                                <tr>
                                    <td height="5" style="font-size:5px;line-height:5px;" bgcolor="#DDD2CC"
                                        data-bgcolor="Shadow Color">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- freya-header-1 -->
                </table>

                <table data-outer-table border="0" align="center" cellpadding="0" cellspacing="0"
                    class="outer-table row" role="presentation" width="640" style="width:640px;max-width:640px;"
                    data-module="freya-footer">
                    <!-- freya-footer -->
                    <tr>
                        <td align="center">

                            <table data-inner-table border="0" align="center" cellpadding="0" cellspacing="0"
                                role="presentation" class="inner-table row container-padding" width="580"
                                style="width:580px;max-width:580px;">
                                <tr>
                                    <td height="100" style="font-size:120px;line-height:120px;"
                                        data-height="Spacing top">&nbsp;</td>
                                </tr>
                                <tr data-element="freya-footer-social-icons-contact"
                                    data-label="Social Icons & Contact">
                                    <td align="center">
                                        <!-- rwd-col -->
                                        <table border="0" cellpadding="0" cellspacing="0" align="center"
                                            role="presentation" class="container-padding" width="100%"
                                            style="width:100%;max-width:100%;">
                                            <tr>
                                                <td class="rwd-col" align="center" width="41.38%"
                                                    style="width:41.38%;max-width:41.38%;">

                                                    <table border="0" align="left" cellpadding="0" cellspacing="0"
                                                        role="presentation" align="left" class="center-float">
                                                        <tr class="center-on-mobile">
                                                            <td data-element="freya-footer-facebook"
                                                                data-label="Facebook" align="left" valign="middle">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td align="center">
                                                                            <img style="width:24px;border:0px;display: inline!important;"
                                                                                src="https://i.ibb.co/xYhpJGq/facebook.png" width="24"
                                                                                border="0" editable="true" data-icon
                                                                                data-image-edit data-url
                                                                                data-label="Facebook" data-image-width
                                                                                alt="Facebook">
                                                                        </td>
                                                                        <td width="6"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                            <td data-element="freya-footer-twitter" data-label="Twitter"
                                                                align="center" valign="middle">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="6"></td>
                                                                        <td align="center">
                                                                            <img style="width:24px;border:0px;display: inline!important;"
                                                                                src="https://i.ibb.co/ZhkxYSZ/twitter.png" width="24"
                                                                                border="0" editable="true" data-icon
                                                                                data-image-edit data-url
                                                                                data-label="Twitter" data-image-width
                                                                                alt="Twitter">
                                                                        </td>
                                                                        <td width="6"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>

                                                            
                                                            <td data-element="freya-footer-instagram"
                                                                data-label="Instagram" align="center" valign="middle">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="6"></td>
                                                                        <td align="center">
                                                                            <img style="width:24px;border:0px;display: inline!important;"
                                                                                src="https://i.ibb.co/7rcjfBC/instagram.png" width="24"
                                                                                border="0" editable="true" data-icon
                                                                                data-image-edit data-url
                                                                                data-label="Instagram" data-image-width
                                                                                alt="Instagram">
                                                                        </td>
                                                                        <td width="6"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                </td>
                                                <td class="rwd-col" align="center" width="1.62%" height="20"
                                                    style="width:1.62%;max-width:1.62%;height:20px;">&nbsp;</td>
                                                <td class="rwd-col" align="center" width="57%"
                                                    style="width:57%;max-width:57%;">

                                                    <table border="0" cellpadding="0" cellspacing="0" align="right"
                                                        role="presentation" class="center-float">
                                                        <tr class="center-on-mobile">
                                                            <td data-element="freya-footer-email" data-label="Email"
                                                                class="rwd-on-mobile row" align="center"
                                                                valign="middle">
                                                                <!-- Links -->
                                                                <table border="0" cellspacing="0" cellpadding="0"
                                                                    class="center-float">
                                                                    <tr>
                                                                        <td align="center">
                                                                            <singleline>
                                                                                <a href="mailto:info@edike.info" mc:edit
                                                                                    data-button data-text-style="Links"
                                                                                    style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:500;font-style:normal;color:#000000;text-decoration:none;letter-spacing:0px;"><span>info@edike.info</span></a>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                <!-- Links -->
                                                            </td>
                                                            <td data-element="freya-footer-gap" data-label="Gap"
                                                                class="hide-mobile" calign="center">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="5"></td>
                                                                        <td class="center-text"
                                                                            data-text-style="Paragraphs" align="center"
                                                                            style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:500;font-style:normal;color:#666666;text-decoration:none;letter-spacing:0px;">
                                                                            |</td>
                                                                        <td width="5"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                            <td data-element="freya-footer-phone-number"
                                                                data-label="Phone number" class="rwd-on-mobile row"
                                                                align="center" valign="middle">
                                                                <!-- Links -->
                                                                <table border="0" cellspacing="0" cellpadding="0"
                                                                    class="center-float">
                                                                    <tr>
                                                                        <td align="center">
                                                                            <singleline>
                                                                                <a href="tel:+33-738-198-7926" mc:edit
                                                                                    data-button data-text-style="Links"
                                                                                    style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:500;font-style:normal;color:#000000;text-decoration:none;letter-spacing:0px;"><span>+234 702 5000 490</span></a>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                <!-- Links -->
                                                            </td>
                                                        </tr>
                                                    </table>

                                                </td>
                                            </tr>
                                        </table>
                                        <!-- rwd-col -->
                                    </td>
                                </tr>
                                <tr data-element="freya-footer-social-icons-contact"
                                    data-label="Social Icons & Contact">
                                    <td height="30" style="font-size:30px;line-height:30px;"
                                        data-height="Spacing under social icons & contact">&nbsp;</td>
                                </tr>
                                <tr data-element="freya-footer-copyrights-apps" data-label="Copyrights & Apps">
                                    <td height="20" style="font-size:20px;line-height:20px;"
                                        data-height="Spacing under copyrights & apps">&nbsp;</td>
                                </tr>
                            </table>

                            <table border="0" align="center" cellpadding="0" cellspacing="0" role="presentation"
                                width="100%" style="width:100%;max-width:100%;">
                                <tr data-element="freya-brand-colors" data-label="Brand Colors">
                                    <td align="center">
                                        <!-- Brand Colors -->
                                        <table border="0" align="center" cellpadding="0" cellspacing="0"
                                            role="presentation" width="100%" style="width:100%;max-width:100%;">
                                            <tr>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="1st Color"
                                                    bgcolor="#0C6B55" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="2nd Color"
                                                    bgcolor="#45B88F" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="3rd Color"
                                                    bgcolor="#A9DE90" style="width:33.33%;"></td>
                                            </tr>
                                        </table>
                                        <!-- Brand Colors -->
                                    </td>
                                </tr>
                                <tr data-element="freya-footer-tags" data-label="Footer Tags">
                                    <td align="center" bgcolor="#FFFFFF" data-bgcolor="Footer BgColor">

                                        <table data-inner-table border="0" align="center" cellpadding="0"
                                            cellspacing="0" role="presentation"
                                            class="inner-table row container-padding" width="580"
                                            style="width:580px;max-width:580px;">
                                            <tr>
                                                <td height="20" style="font-size:20px;line-height:20px;"
                                                    data-height="Spacing under brand colors">&nbsp;</td>
                                            </tr>
                                            <tr data-element="freya-footer-permission-reminder"
                                                data-label="Permission reminder">
                                                <td data-text-style="Paragraphs" align="left" class="center-text"
                                                    style="font-family:'Roboto',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:400;font-style:normal;color:#333333;text-decoration:none;letter-spacing:0px;">
                                                    <singleline>
                                                        <div mc:edit data-text-edit>
                                                            Copyright © 2023 Edike. All rights reserved | Powered by <br />
                                                            Competence Asset Management Company Limited.
                                                        </div>
                                                    </singleline>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td height="30" style="font-size:30px;line-height:30px;"
                                                    data-height="Spacing under tags">&nbsp;</td>
                                            </tr>
                                        </table>

                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    <tr class="hide-mobile">
                        <td height="30" style="font-size:30px;line-height:30px;" data-height="Spacing bottom">&nbsp;
                        </td>
                    </tr>
                    <!-- freya-footer -->
                </table>

            </td>
        </tr><!-- Outer-Table -->
    </table>

</body>

</html>

    `,
          };
          mg.messages().send(data, async function (error) {
            if (error) {
              return res.status(400).json({
                msg: error.message,
              });
            }

            return res.status(200).json({
              msg: "We've sent a 6-digit Activation Code to your Email Address",
              status: "valid",
            });
          });
        })
        .catch((err) =>
          res.status(500).json({ msg: err.message, status: "invalid" })
        );
    })
    .catch((err) =>
      res.status(500).json({ msg: err.message, status: "invalid" })
    );
};

const reset = async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({
      msg: "Enter the OTP Code",
      status: "invalid",
    });
  }

  User.findOne({
    resetPasswordToken: req.body.otp,
  }).then((user) => {
    if (!user)
      return res
        .status(401)
        .json({ msg: "Invalid OTP Veification", status: "invalid" });

    user.resetPasswordToken = undefined;

    // Save
    user.save((err) => {
      if (err)
        return res.status(500).json({ msg: err.message, status: "invalid" });
      res.status(200).json({ msg: "Verification Successful", status: "valid" });
    });
  });
};

const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      msg: "Enter All Fields",
      status: "invalid",
    });
  }

  const salt = await bcrypt.genSaltSync(10);
  const hashpassword = await bcrypt.hash(password, salt);

  User.findOne({
    email: req.body.email,
  }).then((user) => {
    if (!user)
      return res
        .status(401)
        .json({ message: "Invalid Email Address", status: "invalid" });

    user.password = hashpassword;
    user.resetPasswordToken = undefined;

    user.save((err) => {
      if (err)
        return res.status(500).json({ msg: err.message, status: "invalid" });
      res
        .status(200)
        .json({ msg: "Your new password has been updated.", status: "valid" });
    });
  });
};

const profileUpdate = async (req, res) => {
  const {
    body: { firstname, lastname, phone },
    user: { id },
  } = req;

  if (!firstname || !lastname || !phone) {
    return res.status(400).json({
      msg: "Enter All Fields",
      status: "invalid",
    });
  }
  const user = await User.findByIdAndUpdate(
    {
      _id: id,
    },
    req.body,
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(400).json({ msg: "Unverified User", status: "invalid" });
  }

  return res.status(StatusCodes.OK).json({
    user,
    msg: "Profile Update Successful",
    status: "valid",
  });
};

const listBank = async (req, res) => {
  const options = {
    method: "GET",
    url: `https://api.paystack.co/bank`,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_APP_KEY}`,
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
  };

  request(options, function (error, body) {
    if (error) {
      return res.status(400).json({
        msg: `${error.message}`,
        status: "invalid",
      });
    }

    const ans = JSON.parse(body.body);
    res.status(StatusCodes.OK).send({ msg: ans, status: "valid" });
  });
};

const addBankStatement = async (req, res) => {
  const bank_file = req.file;
  const { bank_name, loan_access_type } = req.body;
  if (!bank_name || !loan_access_type) {
    return res.status(400).json({
      msg: "Enter all Fields",
      status: "invalid",
    });
  }
  if (!bank_file) {
    return res.status(400).json({
      msg: "Enter Your 6months Bank Statement in Pdf format",
      status: "invalid",
    });
  }

  const userbankStatement = await BankStatement.find({
    createdBy: req.user.id,
  });

  if (!userbankStatement) {
    return res
      .status(400)
      .json({ msg: "Kindly add a valid Bank Statement", status: "invalid" });
  }

  const trans = fs.readFileSync(`${bank_file.path}`, { encoding: "base64" });
  const user = await User.findById({ _id: req.user.id });
  if (!user) {
    return res.status(400).json({ msg: "Unverified User", status: "invalid" });
  }
  const userBankStats = await BankStatement.create({
    createdBy: req.user.id,
    bank_name: req.body.bank_name,
    loan_access_type: req.body.loan_access_type,
    bankPdf: trans,
    pdf_link: req.body.pdf_link,
  });

  await userBankStats.save();
  user.isbankstatementadded = "approved";
  await user.save();
  return res.status(StatusCodes.CREATED).json({
    msg: "Bank Statement Verification Successful",
    status: "valid",
  });
};

const getBankStatement = async (req, res) => {
  const {
    user: { id },
  } = req;

  const userbankStatement = await BankStatement.find({
    createdBy: id,
  });

  if (!userbankStatement) {
    return res
      .status(400)
      .json({ msg: "Bank Statement is not found", status: "invalid" });
  }

  var diff =
    (new Date(`${userbankStatement[0].sixMonths}`).getTime() -
      new Date(`${new Date()}`).getTime()) /
    1000;

  diff /= 60 * 60 * 24 * 7 * 4;
  const monthsDiff = Math.round(diff);

  if (monthsDiff > 1) {
    return res.status(200).json({
      msg: `Bank Statement Exist and is Valid till ${new Date(
        `${userbankStatement[0].sixMonths}`
      ).toDateString()}`,
      status: "valid",
    });
  }
  if (monthsDiff < 1) {
    const userbankStatement = await BankStatement.findByIdAndDelete({
      createdBy: id,
    });
    await userbankStatement.save();

    const user = await User.findById({ _id: id });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "Unverified User", status: "invalid" });
    }
    user.isbankstatementadded = "pending";
    await user.save();

    return res.status(400).json({
      msg: "Bank Statement is Expired , Please Add a New One",
      status: "invalid",
    });
  }
};

const uploadIDCard = async (req, res) => {
  const photo = req.file;
  if (!photo) {
    return res.status(400).json({
      msg: "Please Provide an Image",
      status: "invalid",
    });
  }

  const user = await User.findById({ _id: req.user.id });
  if (user.isidcard === "approved") {
    return res.status(400).json({
      msg: "ID Card Exist Already",
      status: "invalid",
    });
  }

  const result = await cloudinary.uploader.upload(photo.path, {
    public_id: `${Date.now()}`,
    resource_type: "auto",
    folder: "Edike User ID Card Image",
  });

  if (!user) {
    cloudinary.uploader.destroy(`${result.public_id}`);
    return res.status(400).json({
      msg: "Not Authorized",
      status: "invalid",
    });
  }
  user.isidcard = "approved";
  user.idcard = result;
  await user.save();

  return res.status(200).json({
    msg: "ID Card Upload Successful",
    status: "valid",
  });
};

const checkAccountStatus = async () => {
  const user = await User.findById({ _id: req.user.id });

  if (user.status === "blocked") {
    return res.status(200).json({
      msg: "Your Account has been Temporarily Disabled, Please Contact Support",
    });
  }

  if (user.status === "active") {
    return res.status(200).json({
      msg: "",
    });
  }
};

const createAddressBill = async (req, res) => {
  const houseAddressLink = req.files;
  const { houseAddress } = req.body;
  if (!houseAddress) {
    return res.status(400).json({
      msg: "Enter all Fields",
      status: "invalid",
    });
  }

  if (!houseAddressLink) {
    return res.status(400).json({
      msg: "Enter Address Bill in the required Image format",
      status: "invalid",
    });
  }

  const user = await User.findById({ _id: req.user.id });
  if (!user) {
    return res.status(400).json({ msg: "Unverified User", status: "invalid" });
  }

  let multipleFileUpload = houseAddressLink.map((file) =>
    cloudinary.uploader.upload(file.path, {
      public_id: `${Date.now()}`,
      resource_type: "auto",
      folder: "Edike User Location Bill Credentials",
    })
  );

  let result = await Promise.all(multipleFileUpload);

  user.houseAddress = houseAddress;
  user.houseAddressLink = result;
  user.isaddressadded = "approved";
  await user.save();
  return res
    .status(200)
    .json({ msg: "Address Verification Successful", status: "valid" });
};

const createNextOfKinDetails = async (req, res) => {
  const {
    nextofkinfirstname,
    nextofkinlastname,
    nextofkinaddress,
    nextofkinphonenumber,
  } = req.body;

  if (!nextofkinfirstname || !nextofkinlastname || !nextofkinaddress) {
    return res.status(400).json({
      msg: "Enter all Fields",
      status: "invalid",
    });
  }

  if (nextofkinphonenumber.length !== 11) {
    return res.status(400).json({
      msg: "Incomplete Phone Number",
      status: "invalid",
    });
  }

  const user = await User.findById({ _id: req.user.id });
  if (!user) {
    return res.status(400).json({ msg: "Unverified User", status: "invalid" });
  }

  user.nextofkinfirstname = nextofkinfirstname;
  user.nextofkinlastname = nextofkinlastname;
  user.nextofkinaddress = nextofkinaddress;
  user.nextofkinphonenumber = nextofkinphonenumber;
  user.isnextofkin = "approved";
  await user.save();
  return res
    .status(200)
    .json({ msg: "Next Of Kin Verification Successful", status: "valid" });
};

const subscribedmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      msg: "Enter all Fields",
      status: "invalid",
    });
  }

  const user = await Contact.findOne({ email });

  if (user) {
    return res.status(400).json({
      msg: "Email Already Exist",
      status: "invalid",
    });
  }

  // const data = {};

  // // using send grid to send out emails
  // sendEmail.sendGridEmail(
  //   email, // recipient email
  //   "d-87fcca9e10984dbe961d8b6918b949e6", // template id
  //   "You've Subscribed 🎉, Welcome to Edike", // subject
  //   data
  // );

  // return res.status(200).json({
  //   msg: " Welcome Onboard, You have Subscribed Successfully ",
  //   status: "valid",
  // });

  const mg = mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: DOMAIN,
  });
  const data = {
    from: `${process.env.EMAIL_FROM}`,
    to: email,
    subject: "You've Subscribed 🎉, Welcome to Edike",
    html: `
    <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
    <!--[if (gte mso 9)|(IE)]>
  <xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
<![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- So that mobile will display zoomed in -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- enable media queries for windows phone 8 -->
    <meta name="format-detection" content="telephone=no"> <!-- disable auto telephone linking in iOS -->
    <meta name="format-detection" content="date=no"> <!-- disable auto date linking in iOS -->
    <meta name="format-detection" content="address=no"> <!-- disable auto address linking in iOS -->
    <meta name="format-detection" content="email=no"> <!-- disable auto email linking in iOS -->
    <meta name="color-scheme" content="only">
    <title></title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai+Looped:wght@100;200;300;400;500;600;700&family=Roboto:wght@100;300;400;500;700;900&display=swap"
        rel="stylesheet">

    <style type="text/css">
        /*Basics*/
        body {
            margin: 0px !important;
            padding: 0px !important;
            display: block !important;
            min-width: 100% !important;
            width: 100% !important;
            -webkit-text-size-adjust: none;
        }

        table {
            border-spacing: 0;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        table td {
            border-collapse: collapse;
            mso-line-height-rule: exactly;
        }

        td img {
            -ms-interpolation-mode: bicubic;
            width: auto;
            max-width: auto;
            height: auto;
            margin: auto;
            display: block !important;
            border: 0px;
        }

        td p {
            margin: 0;
            padding: 0;
        }

        td div {
            margin: 0;
            padding: 0;
        }

        td a {
            text-decoration: none;
            color: inherit;
        }

        /*Outlook*/
        .ExternalClass {
            width: 100%;
        }

        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
            line-height: inherit;
        }

        .ReadMsgBody {
            width: 100%;
            background-color: #ffffff;
        }

        /* iOS freya LINKS */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        /*Gmail freya links*/
        u+#body a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
        }

        /*Buttons fix*/
        .undoreset a,
        .undoreset a:hover {
            text-decoration: none !important;
        }

        .yshortcuts a {
            border-bottom: none !important;
        }

        .ios-footer a {
            color: #aaaaaa !important;
            text-decoration: none;
        }

        /* data-outer-table="800 - 600" */
        .outer-table {
            width: 640px !important;
            max-width: 640px !important;
        }

        /* data-inner-table="780 - 540" */
        .inner-table {
            width: 580px !important;
            max-width: 580px !important;
        }

        /*Responsive-Tablet*/
        @media only screen and (max-width: 799px) and (min-width: 601px) {
            .outer-table.row {
                width: 640px !important;
                max-width: 640px !important;
            }

            .inner-table.row {
                width: 580px !important;
                max-width: 580px !important;
            }
        }

        /*Responsive-Mobile*/
        @media only screen and (max-width: 600px) and (min-width: 320px) {
            table.row {
                width: 100% !important;
                max-width: 100% !important;
            }

            td.row {
                width: 100% !important;
                max-width: 100% !important;
            }

            .img-responsive img {
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                margin: auto;
            }

            .center-float {
                float: none !important;
                margin: auto !important;
            }

            .center-text {
                text-align: center !important;
            }

            .container-padding {
                width: 100% !important;
                padding-left: 15px !important;
                padding-right: 15px !important;
            }

            .container-padding10 {
                width: 100% !important;
                padding-left: 10px !important;
                padding-right: 10px !important;
            }

            .hide-mobile {
                display: none !important;
            }

            .menu-container {
                text-align: center !important;
            }

            .autoheight {
                height: auto !important;
            }

            .m-padding-10 {
                margin: 10px 0 !important;
            }

            .m-padding-15 {
                margin: 15px 0 !important;
            }

            .m-padding-20 {
                margin: 20px 0 !important;
            }

            .m-padding-30 {
                margin: 30px 0 !important;
            }

            .m-padding-40 {
                margin: 40px 0 !important;
            }

            .m-padding-50 {
                margin: 50px 0 !important;
            }

            .m-padding-60 {
                margin: 60px 0 !important;
            }

            .m-padding-top10 {
                margin: 30px 0 0 0 !important;
            }

            .m-padding-top15 {
                margin: 15px 0 0 0 !important;
            }

            .m-padding-top20 {
                margin: 20px 0 0 0 !important;
            }

            .m-padding-top30 {
                margin: 30px 0 0 0 !important;
            }

            .m-padding-top40 {
                margin: 40px 0 0 0 !important;
            }

            .m-padding-top50 {
                margin: 50px 0 0 0 !important;
            }

            .m-padding-top60 {
                margin: 60px 0 0 0 !important;
            }

            .m-height10 {
                font-size: 10px !important;
                line-height: 10px !important;
                height: 10px !important;
            }

            .m-height15 {
                font-size: 15px !important;
                line-height: 15px !important;
                height: 15px !important;
            }

            .m-height20 {
                font-size: 20px !important;
                line-height: 20px !important;
                height: 20px !important;
            }

            .m-height25 {
                font-size: 25px !important;
                line-height: 25px !important;
                height: 25px !important;
            }

            .m-height30 {
                font-size: 30px !important;
                line-height: 30px !important;
                height: 30px !important;
            }

            .radius6 {
                border-radius: 6px !important;
            }

            .fade-white {
                background-color: rgba(255, 255, 255, 0.8) !important;
            }

            .rwd-on-mobile {
                display: inline-block !important;
                padding: 5px !important;
            }

            .center-on-mobile {
                text-align: center !important;
            }

            .rwd-col {
                width: 100% !important;
                max-width: 100% !important;
                display: inline-block !important;
            }

            .type48 {
                font-size: 48px !important;
                line-height: 48px !important;
            }
        }
    </style>
    <style type="text/css" class="export-delete">
        .composer--mobile table.row {
            width: 100% !important;
            max-width: 100% !important;
        }

        .composer--mobile td.row {
            width: 100% !important;
            max-width: 100% !important;
        }

        .composer--mobile .img-responsive img {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            margin: auto;
        }

        .composer--mobile .center-float {
            float: none !important;
            margin: auto !important;
        }

        .composer--mobile .center-text {
            text-align: center !important;
        }

        .composer--mobile .container-padding {
            width: 100% !important;
            padding-left: 15px !important;
            padding-right: 15px !important;
        }

        .composer--mobile .container-padding10 {
            width: 100% !important;
            padding-left: 10px !important;
            padding-right: 10px !important;
        }

        .composer--mobile .hide-mobile {
            display: none !important;
        }

        .composer--mobile .menu-container {
            text-align: center !important;
        }

        .composer--mobile .autoheight {
            height: auto !important;
        }

        .composer--mobile .m-padding-10 {
            margin: 10px 0 !important;
        }

        .composer--mobile .m-padding-15 {
            margin: 15px 0 !important;
        }

        .composer--mobile .m-padding-20 {
            margin: 20px 0 !important;
        }

        .composer--mobile .m-padding-30 {
            margin: 30px 0 !important;
        }

        .composer--mobile .m-padding-40 {
            margin: 40px 0 !important;
        }

        .composer--mobile .m-padding-50 {
            margin: 50px 0 !important;
        }

        .composer--mobile .m-padding-60 {
            margin: 60px 0 !important;
        }

        .composer--mobile .m-padding-top10 {
            margin: 30px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top15 {
            margin: 15px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top20 {
            margin: 20px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top30 {
            margin: 30px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top40 {
            margin: 40px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top50 {
            margin: 50px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top60 {
            margin: 60px 0 0 0 !important;
        }

        .composer--mobile .m-height10 {
            font-size: 10px !important;
            line-height: 10px !important;
            height: 10px !important;
        }

        .composer--mobile .m-height15 {
            font-size: 15px !important;
            line-height: 15px !important;
            height: 15px !important;
        }

        .composer--mobile .m-height20 {
            font-srobotoize: 20px !important;
            line-height: 20px !important;
            height: 20px !important;
        }

        .composer--mobile .m-height25 {
            font-size: 25px !important;
            line-height: 25px !important;
            height: 25px !important;
        }

        .composer--mobile .m-height30 {
            font-size: 30px !important;
            line-height: 30px !important;
            height: 30px !important;
        }

        .composer--mobile .radius6 {
            border-radius: 6px !important;
        }

        .composer--mobile .fade-white {
            background-color: rgba(255, 255, 255, 0.8) !important;
        }

        .composer--mobile .rwd-on-mobile {
            display: inline-block !important;
            padding: 5px !important;
        }

        .composer--mobile .center-on-mobile {
            text-align: center !important;
        }

        .composer--mobile .rwd-col {
            width: 100% !important;
            max-width: 100% !important;
            display: inline-block !important;
        }

        .composer--mobile .type48 {
            font-size: 48px !important;
            line-height: 48px !important;
        }
    </style>
</head>

<body data-bgcolor="Body"
    style="margin-top: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;"
    bgcolor="#FAEEE7">

    <span class="preheader-text" data-preheader-text
        style="color: transparent; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; visibility: hidden; width: 0; display: none; mso-hide: all;"></span>

    <!-- Preheader white space hack -->
    <div style="display: none; max-height: 0px; overflow: hidden;">
        &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
    </div>

    <div data-primary-font="IBM Plex Sans Thai Looped" data-secondary-font="Roboto"
        style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;">
    </div>

    <table border="0" align="center" cellpadding="0" cellspacing="0" width="100%" style="width:100%;max-width:100%;">
        <tr><!-- Outer Table -->
            <td align="center" data-bgcolor="Body" bgcolor="#E6E5E5" data-composer>

                <table data-outer-table border="0" align="center" cellpadding="0" cellspacing="0"
                    class="outer-table row" role="presentation" width="640" style="width:640px;max-width:640px;"
                    data-module="freya-logo">
                    <!-- freya-logo -->
                    <tr>
                        <td align="center">

                            <!-- Content -->
                            <table border="0" align="center" cellpadding="0" cellspacing="0" role="presentation"
                                width="100%" style="width:100%;max-width:100%;">
                                <tr data-element="freya-brand-colors" data-label="Brand Colors">
                                    <td align="center">
                                        <!-- Brand Colors -->
                                        <table border="0" align="center" cellpadding="0" cellspacing="0"
                                            role="presentation" width="100%" style="width:100%;max-width:100%;">
                                            <tr>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="1st Color"
                                                    bgcolor="#0C6B55" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="2nd Color"
                                                    bgcolor="#45B88F" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="3rd Color"
                                                    bgcolor="#A9DE90" style="width:33.33%;"></td>
                                            </tr>
                                        </table>
                                        <!-- Brand Colors -->
                                    </td>
                                </tr>
                                <tr>
                                    <td height="40" style="font-size:40px;line-height:40px;" data-height="Spacing top">
                                        &nbsp;</td>
                                </tr>
                                <tr data-element="freya-logo" data-label="Logo">
                                    <td align="center">
                                        <table data-inner-table border="0" align="center" cellpadding="0"
                                            cellspacing="0" class="inner-table row container-padding"
                                            role="presentation" width="580" style="width:580px;max-width:580px;">
                                            <tr>
                                                <td align="left">
                                                    <img style="width:160px;border:0px;display: inline!important;"
                                                        src="https://res.cloudinary.com/edikeeduloan/image/upload/v1671800748/edike%20logo/flbvdxkotzjvmkhqfcn5.png"
                                                        width="160" border="0" editable="true" data-icon data-image-edit
                                                        data-url data-label="Logo" data-image-width alt="logo">
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <tr>
                                    <td height="10" style="font-size:10px;line-height:10px;"
                                        data-height="Spacing bottom">&nbsp;</td>
                                </tr>
                            </table>
                            <!-- Content -->

                        </td>
                    </tr>
                    <!-- freya-logo -->
                </table>

                <table data-outer-table border="0" align="center" cellpadding="0" cellspacing="0"
                    class="outer-table row container-padding" role="presentation" width="640"
                    style="width:640px;max-width:640px;" data-module="freya-header-1">
                    <!-- freya-header-1 -->
                    <tr>
                        <td align="center" bgcolor="#FFFFFF" data-bgcolor="BgColor" class="container-padding">

                            <table data-inner-table border="0" align="center" cellpadding="0" cellspacing="0"
                                role="presentation" class="inner-table row" width="580"
                                style="width:580px;max-width:580px;">
                                <tr>
                                    <td class="m-height15" height="30" style="font-size:30px;line-height:30px;"
                                        data-height="Spacing top">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <!-- content -->
                                        <table border="0" align="center" cellpadding="0" cellspacing="0"
                                            role="presentation" width="100%" style="width:100%;max-width:100%;">
                                            <tr data-element="freya-header-image" data-label="Header image">
                                                <td height="40" style="font-size:40px;line-height:40px;"
                                                    data-height="Spacing under image">&nbsp;</td>
                                            </tr>
                                            <tr data-element="freya-header-headline" data-label="Header Headlines">
                                                <td class="type48" data-text-style="Header Headlines" align="left"
                                                    style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:30px;line-height:64px;font-weight:300;font-style:normal;color:#325288;text-decoration:none;letter-spacing:0px;">
                                                    <singleline>
                                                        <div mc:edit data-text-edit>
                                                            <strong> You've Subscribed 🎉 .</strong>
                                                        </div>
                                                    </singleline>
                                                </td>
                                            </tr>
                                            
                                            <tr data-element="freya-header-paragraph" data-label="Header Paragraph">
                                                <td data-text-style="Header Paragraph" align="left"
                                                    style="font-family:'Roboto',Arial,Helvetica,sans-serif;font-size:18px;line-height:32px;font-weight:400;font-style:normal;color:#666666;text-decoration:none;letter-spacing:0px;">
                                                    <singleline>
                                                        <p>We're delighted to have you on board..<br/> Our goal is to improve access to education in Nigeria and Africa by bridging the funding gap that exists on the consumer side. We are building a user-friendly ecosystem that provides resources that aid learning and supports parents with the management of financial obligation of school fees payment.
                                                        
                                                        
        </p>
        <h4> Stay tuned for more updates from us at Edike</h4>
                                                    </singleline>
                                                </td>
                                            </tr>
                                            
                                            <tr data-element="freya-header-paragraph" data-label="Header Paragraph">
                                                <td height="30" style="font-size:30px;line-height:30px;" data-height="Spacing under paragraph">&nbsp;</td>
                                            </tr>

                                            <tr data-element="freya-header-user-code" data-label="User code">
                                                <td align="center">
                                                    <!-- rwd-col -->
                                                    <table border="0" cellpadding="0" cellspacing="0" align="left"
                                                        role="presentation">
                                                        <tr>
                                                            <td class="rwd-col" align="center">

                                                                <table border="0" align="left" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td data-text-style="Text Style" align="left"
                                                                            style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:28px;line-height:38px;font-weight:400;font-style:normal;color:#666666;text-decoration:none;letter-spacing:0px;">
                                                                            <singleline>
                                                                                
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>

                                                            </td>
                                                            <td class="rwd-col" align="center" width="10" height="5"
                                                                style="width:10px;max-width:10px;height:5px;">&nbsp;
                                                            </td>
                                                            <td class="rwd-col" align="center">

                                                                <table border="0" align="left" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td data-text-style="Coupon Code Style"
                                                                            align="left"
                                                                            style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:28px;line-height:38px;font-weight:700;font-style:normal;color:#D96098;text-decoration:none;letter-spacing:0px;">
                                                                            <singleline>
                                                                                <div mc:edit data-text-edit>
                                                                                    {{otp}}
                                                                                </div>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>

                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <!-- rwd-col -->
                                                </td>
                                            </tr>
                                            <tr data-element="freya-header-paragraph" data-label="Header Paragraph">
                                                <td height="40" style="font-size:40px;line-height:40px;"
                                                    data-height="Spacing under paragraph">&nbsp;</td>
                                            </tr>
                                            
                                        </table>
                                        <!-- content -->
                                    </td>
                                </tr>
                                <tr>
                                    <td class="m-height15" height="30" style="font-size:30px;line-height:30px;"
                                        data-height="Spacing bottom">&nbsp;</td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <table border="0" align="center" cellpadding="0" cellspacing="0" role="presentation"
                                width="90.63%" style="width:90.63%;max-width:90.63%;">
                                <tr>
                                    <td height="5" style="font-size:5px;line-height:5px;" bgcolor="#DDD2CC"
                                        data-bgcolor="Shadow Color">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- freya-header-1 -->
                </table>

                <table data-outer-table border="0" align="center" cellpadding="0" cellspacing="0"
                    class="outer-table row" role="presentation" width="640" style="width:640px;max-width:640px;"
                    data-module="freya-footer">
                    <!-- freya-footer -->
                    <tr>
                        <td align="center">

                            <table data-inner-table border="0" align="center" cellpadding="0" cellspacing="0"
                                role="presentation" class="inner-table row container-padding" width="580"
                                style="width:580px;max-width:580px;">
                                <tr>
                                    <td height="100" style="font-size:120px;line-height:120px;"
                                        data-height="Spacing top">&nbsp;</td>
                                </tr>
                                <tr data-element="freya-footer-social-icons-contact"
                                    data-label="Social Icons & Contact">
                                    <td align="center">
                                        <!-- rwd-col -->
                                        <table border="0" cellpadding="0" cellspacing="0" align="center"
                                            role="presentation" class="container-padding" width="100%"
                                            style="width:100%;max-width:100%;">
                                            <tr>
                                                <td class="rwd-col" align="center" width="41.38%"
                                                    style="width:41.38%;max-width:41.38%;">

                                                    <table border="0" align="left" cellpadding="0" cellspacing="0"
                                                        role="presentation" align="left" class="center-float">
                                                        <tr class="center-on-mobile">
                                                            <td data-element="freya-footer-facebook"
                                                                data-label="Facebook" align="left" valign="middle">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td align="center">
                                                                            <img style="width:24px;border:0px;display: inline!important;"
                                                                                src="https://i.ibb.co/xYhpJGq/facebook.png" width="24"
                                                                                border="0" editable="true" data-icon
                                                                                data-image-edit data-url
                                                                                data-label="Facebook" data-image-width
                                                                                alt="Facebook">
                                                                        </td>
                                                                        <td width="6"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                            <td data-element="freya-footer-twitter" data-label="Twitter"
                                                                align="center" valign="middle">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="6"></td>
                                                                        <td align="center">
                                                                            <img style="width:24px;border:0px;display: inline!important;"
                                                                                src="https://i.ibb.co/ZhkxYSZ/twitter.png" width="24"
                                                                                border="0" editable="true" data-icon
                                                                                data-image-edit data-url
                                                                                data-label="Twitter" data-image-width
                                                                                alt="Twitter">
                                                                        </td>
                                                                        <td width="6"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>

                                                            
                                                            <td data-element="freya-footer-instagram"
                                                                data-label="Instagram" align="center" valign="middle">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="6"></td>
                                                                        <td align="center">
                                                                            <img style="width:24px;border:0px;display: inline!important;"
                                                                                src="https://i.ibb.co/7rcjfBC/instagram.png" width="24"
                                                                                border="0" editable="true" data-icon
                                                                                data-image-edit data-url
                                                                                data-label="Instagram" data-image-width
                                                                                alt="Instagram">
                                                                        </td>
                                                                        <td width="6"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                </td>
                                                <td class="rwd-col" align="center" width="1.62%" height="20"
                                                    style="width:1.62%;max-width:1.62%;height:20px;">&nbsp;</td>
                                                <td class="rwd-col" align="center" width="57%"
                                                    style="width:57%;max-width:57%;">

                                                    <table border="0" cellpadding="0" cellspacing="0" align="right"
                                                        role="presentation" class="center-float">
                                                        <tr class="center-on-mobile">
                                                            <td data-element="freya-footer-email" data-label="Email"
                                                                class="rwd-on-mobile row" align="center"
                                                                valign="middle">
                                                                <!-- Links -->
                                                                <table border="0" cellspacing="0" cellpadding="0"
                                                                    class="center-float">
                                                                    <tr>
                                                                        <td align="center">
                                                                            <singleline>
                                                                                <a href="mailto:info@edike.info" mc:edit
                                                                                    data-button data-text-style="Links"
                                                                                    style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:500;font-style:normal;color:#000000;text-decoration:none;letter-spacing:0px;"><span>info@edike.info</span></a>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                <!-- Links -->
                                                            </td>
                                                            <td data-element="freya-footer-gap" data-label="Gap"
                                                                class="hide-mobile" calign="center">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="5"></td>
                                                                        <td class="center-text"
                                                                            data-text-style="Paragraphs" align="center"
                                                                            style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:500;font-style:normal;color:#666666;text-decoration:none;letter-spacing:0px;">
                                                                            |</td>
                                                                        <td width="5"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                            <td data-element="freya-footer-phone-number"
                                                                data-label="Phone number" class="rwd-on-mobile row"
                                                                align="center" valign="middle">
                                                                <!-- Links -->
                                                                <table border="0" cellspacing="0" cellpadding="0"
                                                                    class="center-float">
                                                                    <tr>
                                                                        <td align="center">
                                                                            <singleline>
                                                                                <a href="tel:+33-738-198-7926" mc:edit
                                                                                    data-button data-text-style="Links"
                                                                                    style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:500;font-style:normal;color:#000000;text-decoration:none;letter-spacing:0px;"><span>+234 702 5000 490</span></a>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                <!-- Links -->
                                                            </td>
                                                        </tr>
                                                    </table>

                                                </td>
                                            </tr>
                                        </table>
                                        <!-- rwd-col -->
                                    </td>
                                </tr>
                                <tr data-element="freya-footer-social-icons-contact"
                                    data-label="Social Icons & Contact">
                                    <td height="30" style="font-size:30px;line-height:30px;"
                                        data-height="Spacing under social icons & contact">&nbsp;</td>
                                </tr>
                                <tr data-element="freya-footer-copyrights-apps" data-label="Copyrights & Apps">
                                    <td height="20" style="font-size:20px;line-height:20px;"
                                        data-height="Spacing under copyrights & apps">&nbsp;</td>
                                </tr>
                            </table>

                            <table border="0" align="center" cellpadding="0" cellspacing="0" role="presentation"
                                width="100%" style="width:100%;max-width:100%;">
                                <tr data-element="freya-brand-colors" data-label="Brand Colors">
                                    <td align="center">
                                        <!-- Brand Colors -->
                                        <table border="0" align="center" cellpadding="0" cellspacing="0"
                                            role="presentation" width="100%" style="width:100%;max-width:100%;">
                                            <tr>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="1st Color"
                                                    bgcolor="#0C6B55" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="2nd Color"
                                                    bgcolor="#45B88F" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="3rd Color"
                                                    bgcolor="#A9DE90" style="width:33.33%;"></td>
                                            </tr>
                                        </table>
                                        <!-- Brand Colors -->
                                    </td>
                                </tr>
                                <tr data-element="freya-footer-tags" data-label="Footer Tags">
                                    <td align="center" bgcolor="#FFFFFF" data-bgcolor="Footer BgColor">

                                        <table data-inner-table border="0" align="center" cellpadding="0"
                                            cellspacing="0" role="presentation"
                                            class="inner-table row container-padding" width="580"
                                            style="width:580px;max-width:580px;">
                                            <tr>
                                                <td height="20" style="font-size:20px;line-height:20px;"
                                                    data-height="Spacing under brand colors">&nbsp;</td>
                                            </tr>
                                            <tr data-element="freya-footer-permission-reminder"
                                                data-label="Permission reminder">
                                                <td data-text-style="Paragraphs" align="left" class="center-text"
                                                    style="font-family:'Roboto',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:400;font-style:normal;color:#333333;text-decoration:none;letter-spacing:0px;">
                                                    <singleline>
                                                        <div mc:edit data-text-edit>
                                                            Copyright © 2023 Edike. All rights reserved | Powered by <br />
                                                            Competence Asset Management Company Limited.
                                                        </div>
                                                    </singleline>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td height="30" style="font-size:30px;line-height:30px;"
                                                    data-height="Spacing under tags">&nbsp;</td>
                                            </tr>
                                        </table>

                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    <tr class="hide-mobile">
                        <td height="30" style="font-size:30px;line-height:30px;" data-height="Spacing bottom">&nbsp;
                        </td>
                    </tr>
                    <!-- freya-footer -->
                </table>

            </td>
        </tr><!-- Outer-Table -->
    </table>

</body>

</html>
    `,
  };
  mg.messages().send(data, async function (error) {
    if (error) {
      return res.status(400).json({
        msg: error.message,
      });
    }
    return res.status(200).json({
      msg: " Welcome Onboard, You have Subscribed Successfully ",
      status: "valid",
    });
  });


  
};

const contactedMail = async (req, res) => {
  const { email, name, message, phone } = req.body;

  if (!email || !name || !message || !phone) {
    return res.status(400).json({
      msg: "Enter all Fields",
      status: "invalid",
    });
  }

  const user = await Contact.findOne({ email });

  if (user) {
    return res.status(400).json({
      msg: "Email Already Exist",
      status: "invalid",
    });
  }

  // const data = {};

  // // using send grid to send out emails
  // sendEmail.sendGridEmail(
  //   email, // recipient email
  //   "d-1645555886504261a478aa2d56589f4d", // template id
  //   "Welcome🎉, We're Delighted!", // subject
  //   data
  // );

  // const newUser = await Contact.create({
  //   name: req.body.name,
  //   email: req.body.email,
  //   phone: `+234${req.body.phone}`,
  //   message: req.body.message,
  // });

  // await newUser.save();

  // return res.status(200).json({
  //   msg: "You will get a feedback from us in a Jiffy! ",
  //   status: "valid",
  // });

  const mg = mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: DOMAIN,
  });
  const data = {
    from: `${process.env.EMAIL_FROM}`,
    to: email,
    subject: "Welcome🎉, We're Delighted!",
    html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
    <!--[if (gte mso 9)|(IE)]>
  <xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
<![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- So that mobile will display zoomed in -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- enable media queries for windows phone 8 -->
    <meta name="format-detection" content="telephone=no"> <!-- disable auto telephone linking in iOS -->
    <meta name="format-detection" content="date=no"> <!-- disable auto date linking in iOS -->
    <meta name="format-detection" content="address=no"> <!-- disable auto address linking in iOS -->
    <meta name="format-detection" content="email=no"> <!-- disable auto email linking in iOS -->
    <meta name="color-scheme" content="only">
    <title></title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai+Looped:wght@100;200;300;400;500;600;700&family=Roboto:wght@100;300;400;500;700;900&display=swap"
        rel="stylesheet">

    <style type="text/css">
        /*Basics*/
        body {
            margin: 0px !important;
            padding: 0px !important;
            display: block !important;
            min-width: 100% !important;
            width: 100% !important;
            -webkit-text-size-adjust: none;
        }

        table {
            border-spacing: 0;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        table td {
            border-collapse: collapse;
            mso-line-height-rule: exactly;
        }

        td img {
            -ms-interpolation-mode: bicubic;
            width: auto;
            max-width: auto;
            height: auto;
            margin: auto;
            display: block !important;
            border: 0px;
        }

        td p {
            margin: 0;
            padding: 0;
        }

        td div {
            margin: 0;
            padding: 0;
        }

        td a {
            text-decoration: none;
            color: inherit;
        }

        /*Outlook*/
        .ExternalClass {
            width: 100%;
        }

        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
            line-height: inherit;
        }

        .ReadMsgBody {
            width: 100%;
            background-color: #ffffff;
        }

        /* iOS freya LINKS */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        /*Gmail freya links*/
        u+#body a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
        }

        /*Buttons fix*/
        .undoreset a,
        .undoreset a:hover {
            text-decoration: none !important;
        }

        .yshortcuts a {
            border-bottom: none !important;
        }

        .ios-footer a {
            color: #aaaaaa !important;
            text-decoration: none;
        }

        /* data-outer-table="800 - 600" */
        .outer-table {
            width: 640px !important;
            max-width: 640px !important;
        }

        /* data-inner-table="780 - 540" */
        .inner-table {
            width: 580px !important;
            max-width: 580px !important;
        }

        /*Responsive-Tablet*/
        @media only screen and (max-width: 799px) and (min-width: 601px) {
            .outer-table.row {
                width: 640px !important;
                max-width: 640px !important;
            }

            .inner-table.row {
                width: 580px !important;
                max-width: 580px !important;
            }
        }

        /*Responsive-Mobile*/
        @media only screen and (max-width: 600px) and (min-width: 320px) {
            table.row {
                width: 100% !important;
                max-width: 100% !important;
            }

            td.row {
                width: 100% !important;
                max-width: 100% !important;
            }

            .img-responsive img {
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                margin: auto;
            }

            .center-float {
                float: none !important;
                margin: auto !important;
            }

            .center-text {
                text-align: center !important;
            }

            .container-padding {
                width: 100% !important;
                padding-left: 15px !important;
                padding-right: 15px !important;
            }

            .container-padding10 {
                width: 100% !important;
                padding-left: 10px !important;
                padding-right: 10px !important;
            }

            .hide-mobile {
                display: none !important;
            }

            .menu-container {
                text-align: center !important;
            }

            .autoheight {
                height: auto !important;
            }

            .m-padding-10 {
                margin: 10px 0 !important;
            }

            .m-padding-15 {
                margin: 15px 0 !important;
            }

            .m-padding-20 {
                margin: 20px 0 !important;
            }

            .m-padding-30 {
                margin: 30px 0 !important;
            }

            .m-padding-40 {
                margin: 40px 0 !important;
            }

            .m-padding-50 {
                margin: 50px 0 !important;
            }

            .m-padding-60 {
                margin: 60px 0 !important;
            }

            .m-padding-top10 {
                margin: 30px 0 0 0 !important;
            }

            .m-padding-top15 {
                margin: 15px 0 0 0 !important;
            }

            .m-padding-top20 {
                margin: 20px 0 0 0 !important;
            }

            .m-padding-top30 {
                margin: 30px 0 0 0 !important;
            }

            .m-padding-top40 {
                margin: 40px 0 0 0 !important;
            }

            .m-padding-top50 {
                margin: 50px 0 0 0 !important;
            }

            .m-padding-top60 {
                margin: 60px 0 0 0 !important;
            }

            .m-height10 {
                font-size: 10px !important;
                line-height: 10px !important;
                height: 10px !important;
            }

            .m-height15 {
                font-size: 15px !important;
                line-height: 15px !important;
                height: 15px !important;
            }

            .m-height20 {
                font-size: 20px !important;
                line-height: 20px !important;
                height: 20px !important;
            }

            .m-height25 {
                font-size: 25px !important;
                line-height: 25px !important;
                height: 25px !important;
            }

            .m-height30 {
                font-size: 30px !important;
                line-height: 30px !important;
                height: 30px !important;
            }

            .radius6 {
                border-radius: 6px !important;
            }

            .fade-white {
                background-color: rgba(255, 255, 255, 0.8) !important;
            }

            .rwd-on-mobile {
                display: inline-block !important;
                padding: 5px !important;
            }

            .center-on-mobile {
                text-align: center !important;
            }

            .rwd-col {
                width: 100% !important;
                max-width: 100% !important;
                display: inline-block !important;
            }

            .type48 {
                font-size: 48px !important;
                line-height: 48px !important;
            }
        }
    </style>
    <style type="text/css" class="export-delete">
        .composer--mobile table.row {
            width: 100% !important;
            max-width: 100% !important;
        }

        .composer--mobile td.row {
            width: 100% !important;
            max-width: 100% !important;
        }

        .composer--mobile .img-responsive img {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            margin: auto;
        }

        .composer--mobile .center-float {
            float: none !important;
            margin: auto !important;
        }

        .composer--mobile .center-text {
            text-align: center !important;
        }

        .composer--mobile .container-padding {
            width: 100% !important;
            padding-left: 15px !important;
            padding-right: 15px !important;
        }

        .composer--mobile .container-padding10 {
            width: 100% !important;
            padding-left: 10px !important;
            padding-right: 10px !important;
        }

        .composer--mobile .hide-mobile {
            display: none !important;
        }

        .composer--mobile .menu-container {
            text-align: center !important;
        }

        .composer--mobile .autoheight {
            height: auto !important;
        }

        .composer--mobile .m-padding-10 {
            margin: 10px 0 !important;
        }

        .composer--mobile .m-padding-15 {
            margin: 15px 0 !important;
        }

        .composer--mobile .m-padding-20 {
            margin: 20px 0 !important;
        }

        .composer--mobile .m-padding-30 {
            margin: 30px 0 !important;
        }

        .composer--mobile .m-padding-40 {
            margin: 40px 0 !important;
        }

        .composer--mobile .m-padding-50 {
            margin: 50px 0 !important;
        }

        .composer--mobile .m-padding-60 {
            margin: 60px 0 !important;
        }

        .composer--mobile .m-padding-top10 {
            margin: 30px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top15 {
            margin: 15px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top20 {
            margin: 20px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top30 {
            margin: 30px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top40 {
            margin: 40px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top50 {
            margin: 50px 0 0 0 !important;
        }

        .composer--mobile .m-padding-top60 {
            margin: 60px 0 0 0 !important;
        }

        .composer--mobile .m-height10 {
            font-size: 10px !important;
            line-height: 10px !important;
            height: 10px !important;
        }

        .composer--mobile .m-height15 {
            font-size: 15px !important;
            line-height: 15px !important;
            height: 15px !important;
        }

        .composer--mobile .m-height20 {
            font-srobotoize: 20px !important;
            line-height: 20px !important;
            height: 20px !important;
        }

        .composer--mobile .m-height25 {
            font-size: 25px !important;
            line-height: 25px !important;
            height: 25px !important;
        }

        .composer--mobile .m-height30 {
            font-size: 30px !important;
            line-height: 30px !important;
            height: 30px !important;
        }

        .composer--mobile .radius6 {
            border-radius: 6px !important;
        }

        .composer--mobile .fade-white {
            background-color: rgba(255, 255, 255, 0.8) !important;
        }

        .composer--mobile .rwd-on-mobile {
            display: inline-block !important;
            padding: 5px !important;
        }

        .composer--mobile .center-on-mobile {
            text-align: center !important;
        }

        .composer--mobile .rwd-col {
            width: 100% !important;
            max-width: 100% !important;
            display: inline-block !important;
        }

        .composer--mobile .type48 {
            font-size: 48px !important;
            line-height: 48px !important;
        }
    </style>
</head>

<body data-bgcolor="Body"
    style="margin-top: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;"
    bgcolor="#FAEEE7">

    <span class="preheader-text" data-preheader-text
        style="color: transparent; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; visibility: hidden; width: 0; display: none; mso-hide: all;"></span>

    <!-- Preheader white space hack -->
    <div style="display: none; max-height: 0px; overflow: hidden;">
        &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
    </div>

    <div data-primary-font="IBM Plex Sans Thai Looped" data-secondary-font="Roboto"
        style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;">
    </div>

    <table border="0" align="center" cellpadding="0" cellspacing="0" width="100%" style="width:100%;max-width:100%;">
        <tr><!-- Outer Table -->
            <td align="center" data-bgcolor="Body" bgcolor="#E6E5E5" data-composer>

                <table data-outer-table border="0" align="center" cellpadding="0" cellspacing="0"
                    class="outer-table row" role="presentation" width="640" style="width:640px;max-width:640px;"
                    data-module="freya-logo">
                    <!-- freya-logo -->
                    <tr>
                        <td align="center">

                            <!-- Content -->
                            <table border="0" align="center" cellpadding="0" cellspacing="0" role="presentation"
                                width="100%" style="width:100%;max-width:100%;">
                                <tr data-element="freya-brand-colors" data-label="Brand Colors">
                                    <td align="center">
                                        <!-- Brand Colors -->
                                        <table border="0" align="center" cellpadding="0" cellspacing="0"
                                            role="presentation" width="100%" style="width:100%;max-width:100%;">
                                            <tr>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="1st Color"
                                                    bgcolor="#0C6B55" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="2nd Color"
                                                    bgcolor="#45B88F" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="3rd Color"
                                                    bgcolor="#A9DE90" style="width:33.33%;"></td>
                                            </tr>
                                        </table>
                                        <!-- Brand Colors -->
                                    </td>
                                </tr>
                                <tr>
                                    <td height="40" style="font-size:40px;line-height:40px;" data-height="Spacing top">
                                        &nbsp;</td>
                                </tr>
                                <tr data-element="freya-logo" data-label="Logo">
                                    <td align="center">
                                        <table data-inner-table border="0" align="center" cellpadding="0"
                                            cellspacing="0" class="inner-table row container-padding"
                                            role="presentation" width="580" style="width:580px;max-width:580px;">
                                            <tr>
                                                <td align="left">
                                                    <img style="width:160px;border:0px;display: inline!important;"
                                                        src="https://res.cloudinary.com/edikeeduloan/image/upload/v1671800748/edike%20logo/flbvdxkotzjvmkhqfcn5.png"
                                                        width="160" border="0" editable="true" data-icon data-image-edit
                                                        data-url data-label="Logo" data-image-width alt="logo">
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <tr>
                                    <td height="10" style="font-size:10px;line-height:10px;"
                                        data-height="Spacing bottom">&nbsp;</td>
                                </tr>
                            </table>
                            <!-- Content -->

                        </td>
                    </tr>
                    <!-- freya-logo -->
                </table>

                <table data-outer-table border="0" align="center" cellpadding="0" cellspacing="0"
                    class="outer-table row container-padding" role="presentation" width="640"
                    style="width:640px;max-width:640px;" data-module="freya-header-1">
                    <!-- freya-header-1 -->
                    <tr>
                        <td align="center" bgcolor="#FFFFFF" data-bgcolor="BgColor" class="container-padding">

                            <table data-inner-table border="0" align="center" cellpadding="0" cellspacing="0"
                                role="presentation" class="inner-table row" width="580"
                                style="width:580px;max-width:580px;">
                                <tr>
                                    <td class="m-height15" height="30" style="font-size:30px;line-height:30px;"
                                        data-height="Spacing top">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <!-- content -->
                                        <table border="0" align="center" cellpadding="0" cellspacing="0"
                                            role="presentation" width="100%" style="width:100%;max-width:100%;">
                                            <tr data-element="freya-header-image" data-label="Header image">
                                                <td height="40" style="font-size:40px;line-height:40px;"
                                                    data-height="Spacing under image">&nbsp;</td>
                                            </tr>
                                            <tr data-element="freya-header-headline" data-label="Header Headlines">
                                                <td class="type48" data-text-style="Header Headlines" align="left"
                                                    style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:30px;line-height:64px;font-weight:300;font-style:normal;color:#325288;text-decoration:none;letter-spacing:0px;">
                                                    <singleline>
                                                        <div mc:edit data-text-edit>
                                                            <strong> Welcome to Edike 🎉</strong>
                                                        </div>
                                                    </singleline>
                                                </td>
                                            </tr>
                                            
                                            <tr data-element="freya-header-paragraph" data-label="Header Paragraph">
                                                <td data-text-style="Header Paragraph" align="left"
                                                    style="font-family:'Roboto',Arial,Helvetica,sans-serif;font-size:18px;line-height:32px;font-weight:400;font-style:normal;color:#666666;text-decoration:none;letter-spacing:0px;">
                                                    <singleline>
                                                       <h3>
        Welcome and Congratulations to You.
        </h3>
        <p>We're delighted to have you on board..<br/> Our goal is to improve access to education in Nigeria and Africa by bridging the funding gap that exists on the consumer side. We are building a user-friendly ecosystem that provides resources that aid learning and supports parents with the management of financial obligation of school fees payment.
        </p>
                                                    </singleline>
                                                </td>
                                            </tr>
                                            
                                            <tr data-element="freya-header-paragraph" data-label="Header Paragraph">
                                                <td height="30" style="font-size:30px;line-height:30px;" data-height="Spacing under paragraph">&nbsp;</td>
                                            </tr>

                                            <tr data-element="freya-header-user-code" data-label="User code">
                                                <td align="center">
                                                    <!-- rwd-col -->
                                                    <table border="0" cellpadding="0" cellspacing="0" align="left"
                                                        role="presentation">
                                                        <tr>
                                                            <td class="rwd-col" align="center">

                                                                <table border="0" align="left" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td data-text-style="Text Style" align="left"
                                                                            style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:28px;line-height:38px;font-weight:400;font-style:normal;color:#666666;text-decoration:none;letter-spacing:0px;">
                                                                            <singleline>
                                                                                
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>

                                                            </td>
                                                            <td class="rwd-col" align="center" width="10" height="5"
                                                                style="width:10px;max-width:10px;height:5px;">&nbsp;
                                                            </td>
                                                            <td class="rwd-col" align="center">

                                                                <table border="0" align="left" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td data-text-style="Coupon Code Style"
                                                                            align="left"
                                                                            style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:28px;line-height:38px;font-weight:700;font-style:normal;color:#D96098;text-decoration:none;letter-spacing:0px;">
                                                                            <singleline>
                                                                                <div mc:edit data-text-edit>
                                                                                    {{otp}}
                                                                                </div>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>

                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <!-- rwd-col -->
                                                </td>
                                            </tr>
                                            <tr data-element="freya-header-paragraph" data-label="Header Paragraph">
                                                <td height="40" style="font-size:40px;line-height:40px;"
                                                    data-height="Spacing under paragraph">&nbsp;</td>
                                            </tr>
                                            
                                        </table>
                                        <!-- content -->
                                    </td>
                                </tr>
                                <tr>
                                    <td class="m-height15" height="30" style="font-size:30px;line-height:30px;"
                                        data-height="Spacing bottom">&nbsp;</td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <table border="0" align="center" cellpadding="0" cellspacing="0" role="presentation"
                                width="90.63%" style="width:90.63%;max-width:90.63%;">
                                <tr>
                                    <td height="5" style="font-size:5px;line-height:5px;" bgcolor="#DDD2CC"
                                        data-bgcolor="Shadow Color">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- freya-header-1 -->
                </table>

                <table data-outer-table border="0" align="center" cellpadding="0" cellspacing="0"
                    class="outer-table row" role="presentation" width="640" style="width:640px;max-width:640px;"
                    data-module="freya-footer">
                    <!-- freya-footer -->
                    <tr>
                        <td align="center">

                            <table data-inner-table border="0" align="center" cellpadding="0" cellspacing="0"
                                role="presentation" class="inner-table row container-padding" width="580"
                                style="width:580px;max-width:580px;">
                                <tr>
                                    <td height="100" style="font-size:120px;line-height:120px;"
                                        data-height="Spacing top">&nbsp;</td>
                                </tr>
                                <tr data-element="freya-footer-social-icons-contact"
                                    data-label="Social Icons & Contact">
                                    <td align="center">
                                        <!-- rwd-col -->
                                        <table border="0" cellpadding="0" cellspacing="0" align="center"
                                            role="presentation" class="container-padding" width="100%"
                                            style="width:100%;max-width:100%;">
                                            <tr>
                                                <td class="rwd-col" align="center" width="41.38%"
                                                    style="width:41.38%;max-width:41.38%;">

                                                    <table border="0" align="left" cellpadding="0" cellspacing="0"
                                                        role="presentation" align="left" class="center-float">
                                                        <tr class="center-on-mobile">
                                                            <td data-element="freya-footer-facebook"
                                                                data-label="Facebook" align="left" valign="middle">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td align="center">
                                                                            <img style="width:24px;border:0px;display: inline!important;"
                                                                                src="https://i.ibb.co/xYhpJGq/facebook.png" width="24"
                                                                                border="0" editable="true" data-icon
                                                                                data-image-edit data-url
                                                                                data-label="Facebook" data-image-width
                                                                                alt="Facebook">
                                                                        </td>
                                                                        <td width="6"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                            <td data-element="freya-footer-twitter" data-label="Twitter"
                                                                align="center" valign="middle">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="6"></td>
                                                                        <td align="center">
                                                                            <img style="width:24px;border:0px;display: inline!important;"
                                                                                src="https://i.ibb.co/ZhkxYSZ/twitter.png" width="24"
                                                                                border="0" editable="true" data-icon
                                                                                data-image-edit data-url
                                                                                data-label="Twitter" data-image-width
                                                                                alt="Twitter">
                                                                        </td>
                                                                        <td width="6"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>

                                                            
                                                            <td data-element="freya-footer-instagram"
                                                                data-label="Instagram" align="center" valign="middle">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="6"></td>
                                                                        <td align="center">
                                                                            <img style="width:24px;border:0px;display: inline!important;"
                                                                                src="https://i.ibb.co/7rcjfBC/instagram.png" width="24"
                                                                                border="0" editable="true" data-icon
                                                                                data-image-edit data-url
                                                                                data-label="Instagram" data-image-width
                                                                                alt="Instagram">
                                                                        </td>
                                                                        <td width="6"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                </td>
                                                <td class="rwd-col" align="center" width="1.62%" height="20"
                                                    style="width:1.62%;max-width:1.62%;height:20px;">&nbsp;</td>
                                                <td class="rwd-col" align="center" width="57%"
                                                    style="width:57%;max-width:57%;">

                                                    <table border="0" cellpadding="0" cellspacing="0" align="right"
                                                        role="presentation" class="center-float">
                                                        <tr class="center-on-mobile">
                                                            <td data-element="freya-footer-email" data-label="Email"
                                                                class="rwd-on-mobile row" align="center"
                                                                valign="middle">
                                                                <!-- Links -->
                                                                <table border="0" cellspacing="0" cellpadding="0"
                                                                    class="center-float">
                                                                    <tr>
                                                                        <td align="center">
                                                                            <singleline>
                                                                                <a href="mailto:info@edike.info" mc:edit
                                                                                    data-button data-text-style="Links"
                                                                                    style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:500;font-style:normal;color:#000000;text-decoration:none;letter-spacing:0px;"><span>info@edike.info</span></a>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                <!-- Links -->
                                                            </td>
                                                            <td data-element="freya-footer-gap" data-label="Gap"
                                                                class="hide-mobile" calign="center">
                                                                <table border="0" align="center" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="5"></td>
                                                                        <td class="center-text"
                                                                            data-text-style="Paragraphs" align="center"
                                                                            style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:500;font-style:normal;color:#666666;text-decoration:none;letter-spacing:0px;">
                                                                            |</td>
                                                                        <td width="5"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                            <td data-element="freya-footer-phone-number"
                                                                data-label="Phone number" class="rwd-on-mobile row"
                                                                align="center" valign="middle">
                                                                <!-- Links -->
                                                                <table border="0" cellspacing="0" cellpadding="0"
                                                                    class="center-float">
                                                                    <tr>
                                                                        <td align="center">
                                                                            <singleline>
                                                                                <a href="tel:+33-738-198-7926" mc:edit
                                                                                    data-button data-text-style="Links"
                                                                                    style="font-family:'IBM Plex Sans Thai Looped',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:500;font-style:normal;color:#000000;text-decoration:none;letter-spacing:0px;"><span>+234 702 5000 490</span></a>
                                                                            </singleline>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                <!-- Links -->
                                                            </td>
                                                        </tr>
                                                    </table>

                                                </td>
                                            </tr>
                                        </table>
                                        <!-- rwd-col -->
                                    </td>
                                </tr>
                                <tr data-element="freya-footer-social-icons-contact"
                                    data-label="Social Icons & Contact">
                                    <td height="30" style="font-size:30px;line-height:30px;"
                                        data-height="Spacing under social icons & contact">&nbsp;</td>
                                </tr>
                                <tr data-element="freya-footer-copyrights-apps" data-label="Copyrights & Apps">
                                    <td height="20" style="font-size:20px;line-height:20px;"
                                        data-height="Spacing under copyrights & apps">&nbsp;</td>
                                </tr>
                            </table>

                            <table border="0" align="center" cellpadding="0" cellspacing="0" role="presentation"
                                width="100%" style="width:100%;max-width:100%;">
                                <tr data-element="freya-brand-colors" data-label="Brand Colors">
                                    <td align="center">
                                        <!-- Brand Colors -->
                                        <table border="0" align="center" cellpadding="0" cellspacing="0"
                                            role="presentation" width="100%" style="width:100%;max-width:100%;">
                                            <tr>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="1st Color"
                                                    bgcolor="#0C6B55" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="2nd Color"
                                                    bgcolor="#45B88F" style="width:33.33%;"></td>
                                                <td align="center" width="33.33%" height="10" data-bgcolor="3rd Color"
                                                    bgcolor="#A9DE90" style="width:33.33%;"></td>
                                            </tr>
                                        </table>
                                        <!-- Brand Colors -->
                                    </td>
                                </tr>
                                <tr data-element="freya-footer-tags" data-label="Footer Tags">
                                    <td align="center" bgcolor="#FFFFFF" data-bgcolor="Footer BgColor">

                                        <table data-inner-table border="0" align="center" cellpadding="0"
                                            cellspacing="0" role="presentation"
                                            class="inner-table row container-padding" width="580"
                                            style="width:580px;max-width:580px;">
                                            <tr>
                                                <td height="20" style="font-size:20px;line-height:20px;"
                                                    data-height="Spacing under brand colors">&nbsp;</td>
                                            </tr>
                                            <tr data-element="freya-footer-permission-reminder"
                                                data-label="Permission reminder">
                                                <td data-text-style="Paragraphs" align="left" class="center-text"
                                                    style="font-family:'Roboto',Arial,Helvetica,sans-serif;font-size:12px;line-height:28px;font-weight:400;font-style:normal;color:#333333;text-decoration:none;letter-spacing:0px;">
                                                    <singleline>
                                                        <div mc:edit data-text-edit>
                                                            Copyright © 2023 Edike. All rights reserved | Powered by <br />
                                                            Competence Asset Management Company Limited.
                                                        </div>
                                                    </singleline>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td height="30" style="font-size:30px;line-height:30px;"
                                                    data-height="Spacing under tags">&nbsp;</td>
                                            </tr>
                                        </table>

                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    <tr class="hide-mobile">
                        <td height="30" style="font-size:30px;line-height:30px;" data-height="Spacing bottom">&nbsp;
                        </td>
                    </tr>
                    <!-- freya-footer -->
                </table>

            </td>
        </tr><!-- Outer-Table -->
    </table>

</body>

</html>
      `,
  };
  mg.messages().send(data, async function (error) {
    if (error) {
      return res.status(400).json({
        msg: error.message,
      });
    }

    const newUser = await Contact.create({
      name: req.body.name,
      email: req.body.email,
      phone: `+234${req.body.phone}`,
      message: req.body.message,
    });

    await newUser.save();

    return res.status(200).json({
      msg: "You will get a feedback from us in a Jiffy! ",
      status: "valid",
    });
  });
};

module.exports = {
  registerEmail,
  loginEmail,
  loadUser,
  activateAccount,
  verifyNIN,
  verifyBVN,
  forgotPassword,
  reset,
  resetPassword,
  profileUpdate,
  listBank,
  resendOTP,
  resendResetPasswordOTP,
  addBankStatement,
  getBankStatement,
  uploadIDCard,
  checkAccountStatus,
  createAddressBill,
  createNextOfKinDetails,
  contactedMail,
  subscribedmail,
};
