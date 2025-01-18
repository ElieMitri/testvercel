"use client";

import Image from "next/image";
import Logo from "../../../public/TEL.png";
import styles from "../styles/Nav.module.css";
import { LuCrown } from "react-icons/lu";
import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
// import { useRouter } from "next/router";
import { useRef, useEffect, useState } from "react";
import { db, auth } from "../../../firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  setDoc,
  doc,
  collection,
  serverTimestamp,
  addDoc,
  getDoc,
  updateDoc,
  signOut,
  getFirestore,
  getDocs,
} from "firebase/firestore";

import { query, where } from "firebase/firestore";
import Link from "next/link";
import { GiHamburgerMenu } from "react-icons/gi";
import Sidebar from "./Sidebar";
import { IoClose } from "react-icons/io5";

import OMT from "../../../public/OMT.png"
import Whish from "../../../public/Whish.png"
import Crypto from "../../../public/Crypto.png"

export default function Navbar() {
  // const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  //   const handleClose = () => setOpen(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [switched, setSwitched] = useState(false);
  const [error, setError] = useState(null);
  const [paid, setPaid] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [memberFirstLetter, setMemberFirstLetter] = useState();
  const [openedSidebar, setOpenedSidebar] = useState(false);
  const [matchingUser, setMatchingUser] = useState(null);
  const [openedPayment, setOpenedPayment] = useState(false);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 320,
    bgcolor: "#2f2f2f",
    borderRadius: "15px",
    padding: "0",
    boxShadow: 24,
    p: 4,
    outline: "none",
  };

  function handleClose() {
    setOpen(false);
    setError(null);
    setPasswordError(null);
  }

  const userEmail = useRef("");
  const userPassword = useRef("");
  const userName = useRef();

  //   function isValidEmail(email) {
  //     const re = /\S+@\S+\.\S+/;
  //     return re.test(email);
  //   }

  async function createAccount(e) {
    e.preventDefault(); // Prevent the default form submission behavior

    const email = userEmail.current.value;
    const password = userPassword.current.value;
    const displayName = userName.current.value;

    // Validate email
    // if (!isValidEmail(email)) {
    //   setError("Email is invalid");
    //   return;
    // }

    // setError(null);

    if (userPassword.current.value.length < 7) {
      setPasswordError("Password should be at least 8 characters");
    } else {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: displayName,
        });

        await addDoc(collection(db, "users"), {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          subscriptionPlan: "FREE",
        });
        setMemberFirstLetter(user.displayName[0]);
      } catch (error) {
        console.error("Error creating account:", error);
        setError(error.message);
      }
    }
  }

  async function login() {
    const email = userEmail.current.value;
    const password = userPassword.current.value;

    if (userPassword.current.value.length < 7) {
      setPasswordError("Password should be at least 8 characters");
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          // ...
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
        });
    }
  }

  function signOut() {
    firebaseSignOut(auth).then(() => {
      //   router.push("/");
    });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      //   console.log(currentUser.displayName[0]);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.body.style.overflow = "";
  }, []);

  function openSidebar() {
    setOpenedSidebar(true);
    document.body.style.overflow = "hidden";
  }
  function closeSidebar() {
    setOpenedSidebar(false);
    document.body.style.overflow = "";
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // console.log(currentUser.auth);
        // console.log(currentUser.email);
        // console.log(currentUser.uid);

        // Call the function to fetch all users from Firestore
        try {
          const usersCollectionRef = collection(db, "users");
          const querySnapshot = await getDocs(usersCollectionRef);

          const users = querySnapshot.docs.map((doc) => ({
            id: doc.id, // UID of the user
            ...doc.data(), // Other user data
          }));

          console.log("Fetched Users:", users);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      } else {
        console.log("No user is signed in.");
      }
    });

    return () => unsubscribe(); // Cleanup the listener
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Get current logged-in user's email
        const currentUserEmail = currentUser.email;
        console.log("Current User Email:", currentUserEmail);

        try {
          // Create a Firestore query to fetch users by email
          const usersCollectionRef = collection(db, "users");
          const q = query(
            usersCollectionRef,
            where("email", "==", currentUserEmail)
          );

          // Get the users that match the email
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            // If a matching user is found
            const matchedUser = querySnapshot.docs[0].data(); // Get the first matching user
            setMatchingUser(matchedUser); // Store the matched user data
            console.log(matchedUser);
            if (matchedUser.subscriptionPlan === "Paid") {
              setPaid(true);
            }
          } else {
            console.log("No user found with this email.");
          }
        } catch (error) {
          console.error("Error fetching users by email:", error);
        }
      } else {
        console.log("No user is signed in.");
      }
    });

    return () => unsubscribe(); // Cleanup the listener when the component unmounts
  }, []);

  function handlePayment() {
    setOpen(true);
  }

  return (
    <>
      {user ? (
        <nav className={styles.nav}>
          <div className={styles.burgerLogo}>
            <h1 className={styles.burgerWrapper}>
              {openedSidebar ? (
                <IoClose className={styles.burger} onClick={closeSidebar} />
              ) : (
                <GiHamburgerMenu
                  className={styles.burger}
                  onClick={openSidebar}
                />
              )}
            </h1>
            <figure className={styles.logoWrapper}>
              <Image src={Logo} className={styles.logo} alt="" />
            </figure>
          </div>
          <div className={styles.navText}>
            <div className={styles.firstLetter}>{user.displayName[0]}</div>

            {paid ? (
              <></>
            ) : (
              <button className={styles.button} onClick={handlePayment}>
                Lab Member <LuCrown className={styles.crown} />
              </button>
            )}
          </div>
          {openedSidebar ? (
            <Sidebar setOpenedSidebar={setOpenedSidebar} />
          ) : (
            <></>
          )}

          <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={open}
            onClose={handleClose}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
              backdrop: {
                timeout: 500,
              },
            }}
          >
            <Fade in={open}>
              <Box sx={style}>
                <div className="login__inputs">
                  <h1 className="login__title">Payment Methods</h1>
                  <div className={styles.paymentMethods}>
                    <div className={styles.paymentMethod}>
                      <Image src={OMT} className={styles.paymentLogoOMT} alt="" priority/>
                      <button className={styles.paymentName}>OMT</button>
                    </div>
                    <div className={styles.paymentMethod}>
                      <Image src={Whish} className={styles.paymentLogoWhish} alt="" priority/>
                      <button className={styles.paymentName}>Whish</button>
                    </div>
                    <div className={styles.paymentMethod}>
                      <Image src={Crypto} className={styles.paymentLogoCrypto} alt="" priority/>
                      <button className={styles.paymentName}>Crypto</button>
                    </div>
                  </div>
                </div>
              </Box>
            </Fade>
          </Modal>
        </nav>
      ) : (
        <nav className={styles.nav}>
          <figure className={styles.logoWrapper}>
            <Image src={Logo} className={styles.logo} alt="" priority />
          </figure>
          <div className={styles.navText}>
            <button className={styles.button} onClick={handleOpen}>
              Lab Member
            </button>
          </div>

          <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={open}
            onClose={handleClose}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
              backdrop: {
                timeout: 500,
              },
            }}
          >
            <Fade in={open}>
              <Box sx={style}>
                {switched ? (
                  <div className="login__inputs">
                    <h1 className="login__title">Login</h1>
                    {error ? (
                      <div className={styles.errorMessage}>{error}</div>
                    ) : (
                      <></>
                    )}
                    <input
                      type="email"
                      className="modal__input"
                      placeholder="Email"
                      ref={userEmail}
                      onChange={() => console.log(userPassword.current.value)}
                    />
                    <div className="password__login">
                      <input
                        type="password"
                        className="modal__input"
                        placeholder="••••••••••••"
                        ref={userPassword}
                        onChange={() => console.log(userPassword.current.value)}
                      />
                      <div>
                        {passwordError ? (
                          <div className={styles.errorMessage}>
                            {passwordError}
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                    <button className="login__btn cursor" onClick={login}>
                      Log in
                    </button>
                    <div className="login__or">
                      <h4 className="login__h4">OR</h4>
                    </div>
                    <button
                      className="login__button"
                      onClick={() => setSwitched(false)}
                    >
                      Create an account
                    </button>
                  </div>
                ) : (
                  <div className="login__inputs">
                    <h1 className="login__title">Sign Up</h1>
                    {error ? (
                      <div className={styles.errorMessage}>{error}</div>
                    ) : (
                      <></>
                    )}
                    <input
                      type="name"
                      className="modal__input"
                      placeholder="Name"
                      ref={userName}
                      // onChange={checkName}
                    />
                    <input
                      type="email"
                      className="modal__input"
                      placeholder="Email"
                      ref={userEmail}
                      // onChange={checkEmail}
                    />
                    <div className="password__login">
                      <input
                        type="password"
                        className="modal__input"
                        placeholder="••••••••••••"
                        ref={userPassword}
                      />
                    </div>
                    <button
                      className="login__btn cursor"
                      onClick={createAccount}
                    >
                      Sign Up
                    </button>
                    <div className="login__or">
                      <h4 className="login__h4">OR</h4>
                    </div>
                    <button
                      className="login__button"
                      onClick={() => setSwitched(true)}
                    >
                      Login
                    </button>
                  </div>
                )}
              </Box>
            </Fade>
          </Modal>
        </nav>
      )}
    </>
  );
}
