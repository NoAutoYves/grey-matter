--
-- PostgreSQL database dump
--

\restrict YgIA8JDWuOowqD8Wrd2KhxjO8cVNbGEnXEleZJkY1bXpTbJab7PISEtOhH8frP9

-- Dumped from database version 14.23 (Ubuntu 14.23-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.23 (Ubuntu 14.23-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: insert_topic_with_grade(integer, text, integer, text); Type: FUNCTION; Schema: public; Owner: greymatter_user
--

CREATE FUNCTION public.insert_topic_with_grade(p_subject_id integer, p_topic_name text, p_grade_id integer, p_description text DEFAULT NULL::text) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_final_topic_name TEXT;
    v_existing_count INTEGER;
    v_topic_id INTEGER;
BEGIN
    -- Check if topic name already exists for this grade
    SELECT COUNT(*) INTO v_existing_count
    FROM topics t
    JOIN exercises e ON e.topic_id = t.topic_id
    WHERE t.topic_name = p_topic_name 
    AND e.grade_id = p_grade_id;
    
    -- If exists for this grade, use name as is
    IF v_existing_count > 0 THEN
        v_final_topic_name := p_topic_name;
    ELSE
        -- Check if topic name exists for any other grade
        SELECT COUNT(*) INTO v_existing_count
        FROM topics t
        JOIN exercises e ON e.topic_id = t.topic_id
        WHERE t.topic_name = p_topic_name;
        
        -- If exists for another grade, append grade level
        IF v_existing_count > 0 THEN
            v_final_topic_name := p_topic_name || ' (Grade ' || p_grade_id || ')';
        ELSE
            v_final_topic_name := p_topic_name;
        END IF;
    END IF;
    
    -- Insert the topic
    INSERT INTO topics (subject_id, topic_name, description)
    VALUES (p_subject_id, v_final_topic_name, p_description)
    RETURNING topic_id INTO v_topic_id;
    
    RETURN v_topic_id;
END;
$$;


ALTER FUNCTION public.insert_topic_with_grade(p_subject_id integer, p_topic_name text, p_grade_id integer, p_description text) OWNER TO greymatter_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: greymatter_user
--

CREATE TABLE public.activity_logs (
    log_id integer NOT NULL,
    user_id integer,
    action character varying(100) NOT NULL,
    details text,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.activity_logs OWNER TO greymatter_user;

--
-- Name: activity_logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: greymatter_user
--

CREATE SEQUENCE public.activity_logs_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activity_logs_log_id_seq OWNER TO greymatter_user;

--
-- Name: activity_logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greymatter_user
--

ALTER SEQUENCE public.activity_logs_log_id_seq OWNED BY public.activity_logs.log_id;


--
-- Name: admin_logs; Type: TABLE; Schema: public; Owner: greymatter_user
--

CREATE TABLE public.admin_logs (
    admin_log_id integer NOT NULL,
    admin_id integer,
    action character varying(100) NOT NULL,
    target_user_id integer,
    target_exercise_id integer,
    details text,
    ip_address character varying(45),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.admin_logs OWNER TO greymatter_user;

--
-- Name: admin_logs_admin_log_id_seq; Type: SEQUENCE; Schema: public; Owner: greymatter_user
--

CREATE SEQUENCE public.admin_logs_admin_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.admin_logs_admin_log_id_seq OWNER TO greymatter_user;

--
-- Name: admin_logs_admin_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greymatter_user
--

ALTER SEQUENCE public.admin_logs_admin_log_id_seq OWNED BY public.admin_logs.admin_log_id;


--
-- Name: email_queue; Type: TABLE; Schema: public; Owner: greymatter_user
--

CREATE TABLE public.email_queue (
    id integer NOT NULL,
    to_email character varying(255) NOT NULL,
    subject character varying(255) NOT NULL,
    body text NOT NULL,
    retry_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    sent_at timestamp without time zone
);


ALTER TABLE public.email_queue OWNER TO greymatter_user;

--
-- Name: email_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: greymatter_user
--

CREATE SEQUENCE public.email_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.email_queue_id_seq OWNER TO greymatter_user;

--
-- Name: email_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greymatter_user
--

ALTER SEQUENCE public.email_queue_id_seq OWNED BY public.email_queue.id;


--
-- Name: exercises; Type: TABLE; Schema: public; Owner: greymatter_user
--

CREATE TABLE public.exercises (
    exercise_id integer NOT NULL,
    subject_id integer,
    grade_id integer,
    term_id integer,
    topic_id integer,
    exercise_name character varying(255) NOT NULL,
    exercise_title character varying(255),
    total_questions integer DEFAULT 0,
    passing_score integer DEFAULT 70,
    is_published boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.exercises OWNER TO greymatter_user;

--
-- Name: exercises_exercise_id_seq; Type: SEQUENCE; Schema: public; Owner: greymatter_user
--

CREATE SEQUENCE public.exercises_exercise_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exercises_exercise_id_seq OWNER TO greymatter_user;

--
-- Name: exercises_exercise_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greymatter_user
--

ALTER SEQUENCE public.exercises_exercise_id_seq OWNED BY public.exercises.exercise_id;


--
-- Name: grades; Type: TABLE; Schema: public; Owner: greymatter_user
--

CREATE TABLE public.grades (
    grade_id integer NOT NULL,
    grade_level integer NOT NULL,
    display_name character varying(50) NOT NULL
);


ALTER TABLE public.grades OWNER TO greymatter_user;

--
-- Name: grades_grade_id_seq; Type: SEQUENCE; Schema: public; Owner: greymatter_user
--

CREATE SEQUENCE public.grades_grade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.grades_grade_id_seq OWNER TO greymatter_user;

--
-- Name: grades_grade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greymatter_user
--

ALTER SEQUENCE public.grades_grade_id_seq OWNED BY public.grades.grade_id;


--
-- Name: questions; Type: TABLE; Schema: public; Owner: greymatter_user
--

CREATE TABLE public.questions (
    question_id integer NOT NULL,
    exercise_id integer,
    question_text text NOT NULL,
    option_a text NOT NULL,
    option_b text NOT NULL,
    option_c text NOT NULL,
    option_d text NOT NULL,
    correct_answer character varying(1) NOT NULL,
    marks integer DEFAULT 1,
    display_order integer DEFAULT 0,
    image_data bytea,
    image_mime_type character varying(50)
);


ALTER TABLE public.questions OWNER TO greymatter_user;

--
-- Name: questions_question_id_seq; Type: SEQUENCE; Schema: public; Owner: greymatter_user
--

CREATE SEQUENCE public.questions_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.questions_question_id_seq OWNER TO greymatter_user;

--
-- Name: questions_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greymatter_user
--

ALTER SEQUENCE public.questions_question_id_seq OWNED BY public.questions.question_id;


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: greymatter_user
--

CREATE TABLE public.subjects (
    subject_id integer NOT NULL,
    subject_name character varying(100) NOT NULL,
    subject_code character varying(10),
    icon character varying(255),
    description text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true
);


ALTER TABLE public.subjects OWNER TO greymatter_user;

--
-- Name: subjects_subject_id_seq; Type: SEQUENCE; Schema: public; Owner: greymatter_user
--

CREATE SEQUENCE public.subjects_subject_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subjects_subject_id_seq OWNER TO greymatter_user;

--
-- Name: subjects_subject_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greymatter_user
--

ALTER SEQUENCE public.subjects_subject_id_seq OWNED BY public.subjects.subject_id;


--
-- Name: terms; Type: TABLE; Schema: public; Owner: greymatter_user
--

CREATE TABLE public.terms (
    term_id integer NOT NULL,
    term_name character varying(50) NOT NULL,
    display_order integer DEFAULT 0
);


ALTER TABLE public.terms OWNER TO greymatter_user;

--
-- Name: terms_term_id_seq; Type: SEQUENCE; Schema: public; Owner: greymatter_user
--

CREATE SEQUENCE public.terms_term_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.terms_term_id_seq OWNER TO greymatter_user;

--
-- Name: terms_term_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greymatter_user
--

ALTER SEQUENCE public.terms_term_id_seq OWNED BY public.terms.term_id;


--
-- Name: topics; Type: TABLE; Schema: public; Owner: greymatter_user
--

CREATE TABLE public.topics (
    topic_id integer NOT NULL,
    subject_id integer,
    topic_name character varying(255) NOT NULL,
    description text,
    display_order integer DEFAULT 0
);


ALTER TABLE public.topics OWNER TO greymatter_user;

--
-- Name: topics_topic_id_seq; Type: SEQUENCE; Schema: public; Owner: greymatter_user
--

CREATE SEQUENCE public.topics_topic_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.topics_topic_id_seq OWNER TO greymatter_user;

--
-- Name: topics_topic_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greymatter_user
--

ALTER SEQUENCE public.topics_topic_id_seq OWNED BY public.topics.topic_id;


--
-- Name: user_feedback; Type: TABLE; Schema: public; Owner: greymatter_user
--

CREATE TABLE public.user_feedback (
    id integer NOT NULL,
    user_id integer,
    exercise_id integer,
    rating integer NOT NULL,
    feedback text,
    score integer,
    total_questions integer,
    time_taken_seconds integer,
    ip_address inet,
    user_agent text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT user_feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.user_feedback OWNER TO greymatter_user;

--
-- Name: user_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: greymatter_user
--

CREATE SEQUENCE public.user_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_feedback_id_seq OWNER TO greymatter_user;

--
-- Name: user_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greymatter_user
--

ALTER SEQUENCE public.user_feedback_id_seq OWNED BY public.user_feedback.id;


--
-- Name: user_notes; Type: TABLE; Schema: public; Owner: greymatter_user
--

CREATE TABLE public.user_notes (
    note_id integer NOT NULL,
    user_id integer,
    exercise_id integer,
    note_text text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_notes OWNER TO greymatter_user;

--
-- Name: user_notes_note_id_seq; Type: SEQUENCE; Schema: public; Owner: greymatter_user
--

CREATE SEQUENCE public.user_notes_note_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_notes_note_id_seq OWNER TO greymatter_user;

--
-- Name: user_notes_note_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greymatter_user
--

ALTER SEQUENCE public.user_notes_note_id_seq OWNED BY public.user_notes.note_id;


--
-- Name: user_progress; Type: TABLE; Schema: public; Owner: greymatter_user
--

CREATE TABLE public.user_progress (
    progress_id integer NOT NULL,
    user_id integer,
    exercise_id integer,
    score integer,
    total_questions integer,
    percentage numeric(5,2),
    time_taken_seconds integer,
    answers jsonb,
    completed_at timestamp without time zone DEFAULT now(),
    retake_count integer DEFAULT 0
);


ALTER TABLE public.user_progress OWNER TO greymatter_user;

--
-- Name: user_progress_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: greymatter_user
--

CREATE SEQUENCE public.user_progress_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_progress_progress_id_seq OWNER TO greymatter_user;

--
-- Name: user_progress_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greymatter_user
--

ALTER SEQUENCE public.user_progress_progress_id_seq OWNED BY public.user_progress.progress_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: greymatter_user
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    bio text,
    avatar character varying(500),
    phone character varying(50),
    country character varying(100),
    is_active boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    is_admin boolean DEFAULT false,
    verification_token character varying(255),
    reset_token character varying(255),
    reset_token_expires timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    last_login timestamp without time zone,
    updated_at timestamp without time zone DEFAULT now(),
    username character varying(100)
);


ALTER TABLE public.users OWNER TO greymatter_user;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: greymatter_user
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_user_id_seq OWNER TO greymatter_user;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greymatter_user
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: activity_logs log_id; Type: DEFAULT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN log_id SET DEFAULT nextval('public.activity_logs_log_id_seq'::regclass);


--
-- Name: admin_logs admin_log_id; Type: DEFAULT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.admin_logs ALTER COLUMN admin_log_id SET DEFAULT nextval('public.admin_logs_admin_log_id_seq'::regclass);


--
-- Name: email_queue id; Type: DEFAULT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.email_queue ALTER COLUMN id SET DEFAULT nextval('public.email_queue_id_seq'::regclass);


--
-- Name: exercises exercise_id; Type: DEFAULT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.exercises ALTER COLUMN exercise_id SET DEFAULT nextval('public.exercises_exercise_id_seq'::regclass);


--
-- Name: grades grade_id; Type: DEFAULT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.grades ALTER COLUMN grade_id SET DEFAULT nextval('public.grades_grade_id_seq'::regclass);


--
-- Name: questions question_id; Type: DEFAULT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.questions ALTER COLUMN question_id SET DEFAULT nextval('public.questions_question_id_seq'::regclass);


--
-- Name: subjects subject_id; Type: DEFAULT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.subjects ALTER COLUMN subject_id SET DEFAULT nextval('public.subjects_subject_id_seq'::regclass);


--
-- Name: terms term_id; Type: DEFAULT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.terms ALTER COLUMN term_id SET DEFAULT nextval('public.terms_term_id_seq'::regclass);


--
-- Name: topics topic_id; Type: DEFAULT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.topics ALTER COLUMN topic_id SET DEFAULT nextval('public.topics_topic_id_seq'::regclass);


--
-- Name: user_feedback id; Type: DEFAULT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.user_feedback ALTER COLUMN id SET DEFAULT nextval('public.user_feedback_id_seq'::regclass);


--
-- Name: user_notes note_id; Type: DEFAULT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.user_notes ALTER COLUMN note_id SET DEFAULT nextval('public.user_notes_note_id_seq'::regclass);


--
-- Name: user_progress progress_id; Type: DEFAULT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.user_progress ALTER COLUMN progress_id SET DEFAULT nextval('public.user_progress_progress_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (log_id);


--
-- Name: admin_logs admin_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_pkey PRIMARY KEY (admin_log_id);


--
-- Name: email_queue email_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.email_queue
    ADD CONSTRAINT email_queue_pkey PRIMARY KEY (id);


--
-- Name: exercises exercises_exercise_name_unique; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_exercise_name_unique UNIQUE (exercise_name);


--
-- Name: exercises exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_pkey PRIMARY KEY (exercise_id);


--
-- Name: grades grades_grade_level_key; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_grade_level_key UNIQUE (grade_level);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (grade_id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (question_id);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (subject_id);


--
-- Name: subjects subjects_subject_name_key; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_subject_name_key UNIQUE (subject_name);


--
-- Name: terms terms_pkey; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.terms
    ADD CONSTRAINT terms_pkey PRIMARY KEY (term_id);


--
-- Name: terms terms_term_name_key; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.terms
    ADD CONSTRAINT terms_term_name_key UNIQUE (term_name);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (topic_id);


--
-- Name: topics topics_subject_id_topic_name_key; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_subject_id_topic_name_key UNIQUE (subject_id, topic_name);


--
-- Name: user_progress unique_user_exercise; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT unique_user_exercise UNIQUE (user_id, exercise_id);


--
-- Name: user_feedback user_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_pkey PRIMARY KEY (id);


--
-- Name: user_notes user_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.user_notes
    ADD CONSTRAINT user_notes_pkey PRIMARY KEY (note_id);


--
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (progress_id);


--
-- Name: user_progress user_progress_user_id_exercise_id_key; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_exercise_id_key UNIQUE (user_id, exercise_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: admin_logs admin_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: exercises exercises_grade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_grade_id_fkey FOREIGN KEY (grade_id) REFERENCES public.grades(grade_id);


--
-- Name: exercises exercises_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id);


--
-- Name: exercises exercises_term_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_term_id_fkey FOREIGN KEY (term_id) REFERENCES public.terms(term_id);


--
-- Name: exercises exercises_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id);


--
-- Name: questions questions_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id) ON DELETE CASCADE;


--
-- Name: topics topics_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id);


--
-- Name: user_feedback user_feedback_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id) ON DELETE SET NULL;


--
-- Name: user_feedback user_feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: user_notes user_notes_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.user_notes
    ADD CONSTRAINT user_notes_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id) ON DELETE CASCADE;


--
-- Name: user_notes user_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.user_notes
    ADD CONSTRAINT user_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: greymatter_user
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict YgIA8JDWuOowqD8Wrd2KhxjO8cVNbGEnXEleZJkY1bXpTbJab7PISEtOhH8frP9

