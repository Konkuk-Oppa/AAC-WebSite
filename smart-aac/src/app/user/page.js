'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './user.module.css';
import { makeUser, getUser } from '../controller';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({name: '', email: ''});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // 이메일 유효성 검사
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 입력값 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    } 

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    let res = await makeUser(formData);
    console.log( res);
    if (!res.success) {
      setErrors({ email: '서버 연결 실패' });
      setIsSubmitting(false);
      return;
    }


    res = await getUser({ email: formData.email });
    if (res.success) {
        router.push('/');
    } else {
        setErrors({ email: '서버 연결 실패' });
    }
    setIsSubmitting(false);
  };

  return (
    <div className={styles.user_container}>
      <div className={styles.user_header}>
        <h1 className={styles.user_title}>가입 및 로그인</h1>
      </div>
      <div className={styles.user_formContainer}>
        <form className={styles.user_form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>이름</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.name ? styles.error : ''}`}
              placeholder="이름을 입력하세요"
              required
            />
            {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.email ? styles.error : ''}`}
              placeholder="이메일을 입력하세요"
              required
            />
            {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
          </div>

          <button
            type="submit"
            className={`${styles.submitButton} ${isSubmitting ? styles.submitting : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>

    </div>
  );
}
