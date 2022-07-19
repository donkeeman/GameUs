import React from "react";
import InputBox from "../../atoms/InputBox/InputBox";
import Button from "../../atoms/Button/Button";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterContext } from "../../../contexts/RegisterContext";

function LoginForm({ label, setEmailPasswordValid }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [isEmailValid, setEmailValid] = useState(false);
  const baseURL = "https://mandarin.api.weniv.co.kr";
  const navigate = useNavigate();

  const emailInput = useRef();
  const passwordInput = useRef();
  const { registerData, setRegisterData } = useContext(RegisterContext);
  const emailRegExp = /^[a-zA-Z0-9+-\\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i;

  // email과 password 내용이 바뀌면 에러가 표시되지 않도록 비웁니다.
  useEffect(() => {
    setEmailError("");
    setEmailValid(false);
  }, [email]);

  useEffect(() => {
    setPasswordError("");
  }, [password]);

  // 이메일과 비밀번호 둘 다 input이므로 한꺼번에 관리합니다.
  function handleLoginInputData(event) {
    // input 타입이 "email" 이면 이메일 세팅
    if (event.target.type === "email") {
      setEmail(event.target.value);
    }
    // input 타입이 "password" 이면 비밀번호 세팅
    else if (event.target.type === "password") {
      setPassword(event.target.value);
    }
  }

  async function handleBlurEmail() {
    const reqBody = {
      user: {
        email: email,
      },
    };
    try {
      const data = await fetch(baseURL + "/user/emailvalid", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(reqBody),
      });
      const result = await data.json();

      if (result.message == "이미 가입된 이메일 주소 입니다.") {
        setEmailError(result.message);
      } else {
        setEmailValid(true);
      }
    } catch (error) {
      console.log(error.message);
    }
    if (!email) {
      setEmailError("이메일을 입력해 주세요.");
    } else if (!email.match(emailRegExp)) {
      setEmailError("잘못된 이메일 형식입니다.");
    }
  }

  function handleBlurPassword() {
    if (!password) {
      setPasswordError("비밀번호를 입력해 주세요.");
    } else if (password.length < 6) {
      setPasswordError("비밀번호는 6자 이상 입력해 주세요.");
    } else {
      setPasswordError("");
    }
  }

  async function handleLogin() {
    const reqBody = {
      user: {
        email: email,
        password: password,
      },
    };

    try {
      const data = await fetch(baseURL + "/user/login", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(reqBody),
      });
      const result = await data.json();
      // 이메일 란이 비어있는 경우
      if (!email) {
        setEmailError("이메일을 입력해 주세요.");
        emailInput.current.focus();
      }
      // 비밀번호 란이 비어있는 경우
      else if (!password) {
        setPasswordError("비밀번호를 입력해 주세요.");
        passwordInput.current.focus();
      }
      // 이메일 형식이 일치하지 않는 경우 (button type이 submit이 아니라서 여기에서 유효성을 검사합니다.)
      else if (!email.match(emailRegExp)) {
        setEmailError("잘못된 이메일 형식입니다.");
        emailInput.current.focus();
      }
      // 이메일, 비밀번호가 일치하지 않는 경우
      else if (result.status === 422) {
        emailInput.current.focus();
        setPasswordError(result.message);
      }
      // 이메일, 비밀번호가 둘 다 빈 경우는 아예 버튼을 disabled 시켰기 때문에 따로 에러 메시지를 띄우지 않게 했습니다.

      // 로컬 스토리지에 accountname 저장
      window.localStorage.removeItem("accountname");
      window.localStorage.setItem("accountname", result.user.accountname);
      // 로컬 스토리지에 남아 있는 토큰을 지우고 다시 토큰을 설정합니다.
      // 로그아웃 기능이 따로 없는 거 같아서 우선은 로그인하면서 지워줍니다.
      window.localStorage.removeItem("token");
      window.localStorage.setItem("token", result.user.token);

      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  }

  function handleCheckEmail() {
    emailInput.current.blur();
    passwordInput.current.blur();

    if (!emailError && !passwordError && isEmailValid) {
      const data = registerData;
      data.user.email = email;
      data.user.password = password;
      setRegisterData(data);
      console.log(registerData);
      setEmailPasswordValid(true);
    }
  }

  return (
    <form>
      <InputBox
        id="email"
        type="email"
        name="이메일"
        value={email}
        onBlur={handleBlurEmail}
        onChange={handleLoginInputData}
        error={emailError}
        innerRef={emailInput}
      />
      <InputBox
        id="password"
        type="password"
        name="비밀번호"
        value={password}
        onBlur={handleBlurPassword}
        onChange={handleLoginInputData}
        error={passwordError}
        innerRef={passwordInput}
      />
      <Button
        href={null}
        size="large"
        label={label}
        active={email && password && true}
        primary={true}
        onClick={label === "로그인" ? handleLogin : handleCheckEmail}
      />
    </form>
  );
}

export default LoginForm;
