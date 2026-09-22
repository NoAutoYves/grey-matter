--
-- PostgreSQL database dump
--

\restrict hD1zCEdw0BgxGMC2BuF1ccXLONZHbApF1W3FDqZ20IoQD9ygUIfssx02i2VWDcY

-- Dumped from database version 17.9
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    log_id integer NOT NULL,
    user_id integer,
    action character varying(100) NOT NULL,
    details text,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: activity_logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activity_logs_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_logs_log_id_seq OWNER TO postgres;

--
-- Name: activity_logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activity_logs_log_id_seq OWNED BY public.activity_logs.log_id;


--
-- Name: admin_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_logs (
    admin_log_id integer NOT NULL,
    admin_id integer,
    action character varying(100) NOT NULL,
    target_user_id integer,
    target_exercise_id integer,
    details text,
    ip_address character varying(45),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admin_logs OWNER TO postgres;

--
-- Name: admin_logs_admin_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_logs_admin_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_logs_admin_log_id_seq OWNER TO postgres;

--
-- Name: admin_logs_admin_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_logs_admin_log_id_seq OWNED BY public.admin_logs.admin_log_id;


--
-- Name: exercises; Type: TABLE; Schema: public; Owner: postgres
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.exercises OWNER TO postgres;

--
-- Name: exercises_exercise_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exercises_exercise_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercises_exercise_id_seq OWNER TO postgres;

--
-- Name: exercises_exercise_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exercises_exercise_id_seq OWNED BY public.exercises.exercise_id;


--
-- Name: grades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grades (
    grade_id integer NOT NULL,
    grade_level integer NOT NULL,
    display_name character varying(50) NOT NULL
);


ALTER TABLE public.grades OWNER TO postgres;

--
-- Name: grades_grade_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.grades_grade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.grades_grade_id_seq OWNER TO postgres;

--
-- Name: grades_grade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.grades_grade_id_seq OWNED BY public.grades.grade_id;


--
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.questions OWNER TO postgres;

--
-- Name: questions_question_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.questions_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.questions_question_id_seq OWNER TO postgres;

--
-- Name: questions_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.questions_question_id_seq OWNED BY public.questions.question_id;


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.subjects OWNER TO postgres;

--
-- Name: subjects_subject_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subjects_subject_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subjects_subject_id_seq OWNER TO postgres;

--
-- Name: subjects_subject_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subjects_subject_id_seq OWNED BY public.subjects.subject_id;


--
-- Name: terms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.terms (
    term_id integer NOT NULL,
    term_name character varying(50) NOT NULL,
    display_order integer DEFAULT 0
);


ALTER TABLE public.terms OWNER TO postgres;

--
-- Name: terms_term_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.terms_term_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.terms_term_id_seq OWNER TO postgres;

--
-- Name: terms_term_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.terms_term_id_seq OWNED BY public.terms.term_id;


--
-- Name: topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.topics (
    topic_id integer NOT NULL,
    subject_id integer,
    topic_name character varying(255) NOT NULL,
    description text,
    display_order integer DEFAULT 0
);


ALTER TABLE public.topics OWNER TO postgres;

--
-- Name: topics_topic_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.topics_topic_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.topics_topic_id_seq OWNER TO postgres;

--
-- Name: topics_topic_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.topics_topic_id_seq OWNED BY public.topics.topic_id;


--
-- Name: user_feedback; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.user_feedback OWNER TO postgres;

--
-- Name: user_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_feedback_id_seq OWNER TO postgres;

--
-- Name: user_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_feedback_id_seq OWNED BY public.user_feedback.id;


--
-- Name: user_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_notes (
    note_id integer NOT NULL,
    user_id integer,
    exercise_id integer,
    note_text text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_notes OWNER TO postgres;

--
-- Name: user_notes_note_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_notes_note_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_notes_note_id_seq OWNER TO postgres;

--
-- Name: user_notes_note_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_notes_note_id_seq OWNED BY public.user_notes.note_id;


--
-- Name: user_progress; Type: TABLE; Schema: public; Owner: postgres
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
    completed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    retake_count integer DEFAULT 0
);


ALTER TABLE public.user_progress OWNER TO postgres;

--
-- Name: user_progress_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_progress_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_progress_progress_id_seq OWNER TO postgres;

--
-- Name: user_progress_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_progress_progress_id_seq OWNED BY public.user_progress.progress_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    username character varying(100),
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: activity_logs log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN log_id SET DEFAULT nextval('public.activity_logs_log_id_seq'::regclass);


--
-- Name: admin_logs admin_log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_logs ALTER COLUMN admin_log_id SET DEFAULT nextval('public.admin_logs_admin_log_id_seq'::regclass);


--
-- Name: exercises exercise_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises ALTER COLUMN exercise_id SET DEFAULT nextval('public.exercises_exercise_id_seq'::regclass);


--
-- Name: grades grade_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades ALTER COLUMN grade_id SET DEFAULT nextval('public.grades_grade_id_seq'::regclass);


--
-- Name: questions question_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions ALTER COLUMN question_id SET DEFAULT nextval('public.questions_question_id_seq'::regclass);


--
-- Name: subjects subject_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects ALTER COLUMN subject_id SET DEFAULT nextval('public.subjects_subject_id_seq'::regclass);


--
-- Name: terms term_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.terms ALTER COLUMN term_id SET DEFAULT nextval('public.terms_term_id_seq'::regclass);


--
-- Name: topics topic_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics ALTER COLUMN topic_id SET DEFAULT nextval('public.topics_topic_id_seq'::regclass);


--
-- Name: user_feedback id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_feedback ALTER COLUMN id SET DEFAULT nextval('public.user_feedback_id_seq'::regclass);


--
-- Name: user_notes note_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notes ALTER COLUMN note_id SET DEFAULT nextval('public.user_notes_note_id_seq'::regclass);


--
-- Name: user_progress progress_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress ALTER COLUMN progress_id SET DEFAULT nextval('public.user_progress_progress_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (log_id, user_id, action, details, ip_address, user_agent, created_at) FROM stdin;
2	1	exercise_completed	Exercise 1 - Score: 0/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-07 14:42:17.910409
3	1	exercise_completed	Exercise 1 - Score: 7/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-07 15:09:44.729347
4	1	exercise_completed	Exercise 1 - Score: 7/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-07 15:09:44.817251
5	1	exercise_completed	Exercise 1 - Score: 7/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-07 15:13:51.313971
6	1	exercise_completed	Exercise 1 - Score: 7/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-07 15:13:51.396655
7	1	exercise_completed	Exercise 1 - Score: 7/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-07 15:14:50.222389
8	1	exercise_completed	Exercise 1 - Score: 7/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-07 15:14:50.250755
9	1	exercise_completed	Exercise 1 - Score: 2/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-07 15:21:20.296103
21	5	exercise_completed	Exercise 1 - Score: 9/10	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 10:16:29.166257
22	5	exercise_started	Started accounting exercise: accounting_basics_exercise_1 (ID: 1) with 10 questions	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 12:24:27.986311
23	5	exercise_started	Started accounting exercise: accounting_basics_exercise_1 (ID: 1) with 10 questions	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 12:24:28.200241
24	5	exercise_started	Started accounting exercise: accounting_basics_exercise_1 (ID: 1) with 10 questions	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 12:24:44.408285
25	5	exercise_started	Started accounting exercise: accounting_basics_exercise_1 (ID: 1) with 10 questions	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 12:24:44.591017
26	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 12:49:07.372793
27	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 12:49:07.618191
28	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 12:49:07.803809
29	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 12:49:07.981836
30	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 12:56:27.617346
31	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 12:56:27.87923
32	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 12:56:28.347939
33	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 12:56:28.501972
34	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:00:10.395929
35	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:00:10.656415
36	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:00:10.948908
37	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:00:11.148324
38	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:10:38.866449
39	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:10:39.10469
40	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:10:40.273877
41	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:10:40.470607
42	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:12:08.559818
43	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:12:08.621567
44	5	exercise_list_view	Viewed accounting exercises: 1/1 completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:12:09.557422
45	5	exercise_list_view	Viewed accounting exercises: 1/1 completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:12:09.599594
46	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:12:16.320977
47	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:12:28.251939
48	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:12:28.254026
49	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:12:28.29901
50	5	avatar_update_success	Uploaded avatar: /uploads/avatars/user_5_avatar_.jpg	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:12:54.535494
51	1	login_success	User madonselakamogelo@gmail.com logged in	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:13:23.236188
52	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:13:25.03549
53	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:13:25.047817
54	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:13:25.239146
55	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:13:25.253138
56	1	forgot_password_request	Reset token generated for madonselakamogelo@gmail.com	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:13:40.595667
57	1	reset_email_sent	Reset email sent to madonselakamogelo@gmail.com	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:13:49.945903
58	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:13:51.636445
59	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:13:51.788933
60	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:13:51.93679
61	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:13:52.078093
62	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:18:02.938766
63	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:18:03.123032
64	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:18:03.553753
65	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:18:03.885125
66	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:18:26.074083
67	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:18:26.085028
68	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:18:26.373378
69	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:18:26.455154
70	1	logout	User logged out	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:18:31.162428
71	\N	profile_view_failed	Not logged in	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:18:34.643965
72	\N	profile_view_failed	Not logged in	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:18:34.744977
73	\N	signup_failed	Invalid email: nhlanhlamahlangu698@gmail	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:19:29.580458
74	6	signup_success	User created with email nhlanhlamahlangu698@gmail.com	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:19:42.259865
75	\N	login_failed	User not found: nhlanhlamahlangu698@gmail	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:19:56.448044
76	6	login_success	User nhlanhlamahlangu698@gmail.com logged in	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:20:04.363518
77	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:20:06.325522
78	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:20:06.357118
79	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:20:06.621924
80	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:20:06.708592
81	6	avatar_update_success	Uploaded avatar: /uploads/avatars/user_6_avatar_.jpg	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:20:40.647513
82	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:21:32.179524
83	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:21:32.191824
84	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:21:32.381845
85	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:21:32.41368
86	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:21:34.939695
87	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:21:35.216344
88	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:21:35.456437
89	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:21:35.598707
90	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:21:38.404144
91	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:21:38.434788
92	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:21:38.626051
93	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:21:38.634199
94	6	profile_edit_success	Updated: username=BigMamaZ	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:10.85422
95	6	update_info_success	Updated: first_name=Tiffany , last_name=Mahlangu	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:11.121863
96	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:17.411691
97	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:19.442137
98	6	exercise_list_view	Viewed accounting exercises: 0/1 completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:19.597698
99	6	exercise_list_view	Viewed accounting exercises: 0/1 completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:19.636462
100	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:21.434648
101	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:22.666561
102	6	exercise_list_failed	Subject not found: business	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:22.688036
103	6	exercise_list_failed	Subject not found: business	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:22.69775
104	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:24.20711
105	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:41.527378
106	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:41.54719
107	6	exercise_list_failed	Subject not found: business	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:41.765855
108	6	exercise_list_failed	Subject not found: business	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:41.77476
109	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:51.731878
110	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:52.771352
111	6	exercise_list_view	Viewed accounting exercises: 0/1 completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:52.901631
112	6	exercise_list_view	Viewed accounting exercises: 0/1 completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:52.927428
113	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:55.844204
114	6	exercise_started	Started exercise 1 for subject accounting	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:55.867242
115	6	exercise_started	Started exercise 1 for subject accounting	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:22:55.977251
116	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:25:35.9208
117	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:25:36.107417
118	6	exercise_started	Started exercise 1 for subject accounting	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:25:36.444057
119	6	exercise_started	Started exercise 1 for subject accounting	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:25:36.46331
120	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:25:39.011553
121	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:25:39.200451
122	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:25:39.6385
123	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:25:39.810551
124	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:25:39.906657
125	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:25:39.929687
126	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:25:42.531007
127	6	exercise_list_view	Viewed accounting exercises: 0/1 completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:25:42.665343
128	6	exercise_list_view	Viewed accounting exercises: 0/1 completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:25:42.71945
129	6	exercise_started	Started exercise 1 for subject accounting	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:25:53.794592
130	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:25:53.840417
131	6	exercise_started	Started exercise 1 for subject accounting	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:25:53.849576
132	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:26:04.162485
133	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:26:04.1777
134	6	exercise_list_failed	Subject not found: maths	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:26:09.25111
135	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:26:09.309508
136	6	exercise_list_failed	Subject not found: maths	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:26:09.314675
137	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:26:13.467514
138	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:26:17.852663
139	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:26:17.869196
140	6	profile_view	Profile viewed - 0 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-08 17:26:17.957473
141	5	logout	User logged out	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:26:53.628867
142	1	login_success	User madonselakamogelo@gmail.com logged in	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:27:06.73281
143	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:27:12.741396
144	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:27:12.940879
145	1	admin_stats_view	Stats: 3 users, 1 exercises	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:27:13.322363
146	1	admin_stats_view	Stats: 3 users, 1 exercises	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:27:13.864259
147	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:27:25.319054
148	1	admin_users_view	Viewed 3 users	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:27:25.40623
149	1	admin_users_view	Viewed 3 users	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:27:25.655062
150	1	admin_view_activity	Viewed activity for user 6	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:28:19.970209
151	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:28:53.537865
152	1	admin_list_exercises	Listed 1 exercises	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:28:53.685061
153	1	admin_grades_view	Viewed 5 grades	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:28:53.707557
154	1	admin_terms_view	Viewed 4 terms	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:28:53.782266
155	1	admin_subjects_view	Viewed 8 subjects	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:28:53.838302
156	1	admin_list_exercises	Listed 1 exercises	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:28:54.241748
157	1	admin_grades_view	Viewed 5 grades	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:28:54.305524
158	1	admin_terms_view	Viewed 4 terms	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:28:54.357344
159	1	admin_subjects_view	Viewed 8 subjects	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:28:54.376597
160	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:29:41.754049
161	1	admin_analytics_view	Viewed analytics dashboard	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:29:41.835375
162	1	admin_analytics_view	Viewed analytics dashboard	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 17:29:42.184099
163	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 22:40:15.783499
164	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 22:40:16.108249
165	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 22:40:16.299445
166	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 22:40:16.503438
167	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 22:40:21.041331
168	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 22:40:22.517903
169	1	exercise_list_view	Viewed accounting exercises: 1/1 completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 22:40:22.723304
170	1	exercise_list_view	Viewed accounting exercises: 1/1 completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 22:40:23.167205
171	1	results_view	Viewed results for exercise 1 - Score: 2/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 22:40:26.156834
172	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 22:40:26.196676
173	1	results_view	Viewed results for exercise 1 - Score: 2/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-08 22:40:26.350918
174	\N	profile_view_failed	Not logged in	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:04:47.836211
175	\N	profile_view_failed	Not logged in	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:04:48.021802
176	1	login_success	User madonselakamogelo@gmail.com logged in	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:05:04.934298
177	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:06:21.922651
178	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:06:22.161821
179	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:06:22.389684
180	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:06:22.585987
181	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:47:58.930909
182	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:47:59.194478
183	1	exercise_list_view	Viewed economics exercises: 0/0 completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:47:59.339661
184	1	exercise_list_view	Viewed economics exercises: 0/0 completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:47:59.633368
185	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:48:02.491386
186	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:48:02.720722
187	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:48:02.897156
188	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:48:16.084974
189	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:48:16.310203
190	1	admin_stats_view	Stats: 3 users, 1 exercises	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:48:16.503838
191	1	admin_stats_view	Stats: 3 users, 1 exercises	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:48:16.772123
192	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:48:22.13466
193	1	admin_analytics_view	Viewed analytics dashboard	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:48:22.357242
194	1	admin_analytics_view	Viewed analytics dashboard	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:48:22.628428
195	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:49:21.278753
196	1	admin_terms_view	Viewed 4 terms	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:49:21.391935
197	1	admin_subjects_view	Viewed 8 subjects	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:49:21.410276
198	1	admin_list_exercises	Listed 1 exercises	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:49:21.451783
199	1	admin_grades_view	Viewed 5 grades	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:49:21.498447
200	1	admin_terms_view	Viewed 4 terms	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:49:21.814179
201	1	admin_subjects_view	Viewed 8 subjects	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:49:21.873476
202	1	admin_list_exercises	Listed 1 exercises	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:49:21.892959
203	1	admin_grades_view	Viewed 5 grades	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:49:21.921905
204	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:51:12.075199
205	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:51:12.342464
206	1	admin_grades_view	Viewed 5 grades	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:51:12.471572
207	1	admin_terms_view	Viewed 4 terms	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:51:12.530021
208	1	admin_list_exercises	Listed 1 exercises	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:51:12.545353
209	1	admin_subjects_view	Viewed 8 subjects	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:51:12.558806
210	1	admin_grades_view	Viewed 5 grades	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:51:12.883054
211	1	admin_terms_view	Viewed 4 terms	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:51:12.911803
212	1	admin_list_exercises	Listed 1 exercises	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:51:12.912545
213	1	admin_subjects_view	Viewed 8 subjects	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-09 14:51:12.957441
214	\N	profile_view_failed	Not logged in	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-10 00:04:52.656336
215	\N	profile_view_failed	Not logged in	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-10 00:04:52.841267
216	\N	login_failed	Missing email or password	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-10 00:12:08.489594
217	\N	login_failed	Missing email or password	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-10 00:12:17.277121
218	\N	login_failed	Missing email or password	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-10 00:12:18.251786
219	\N	login_failed	Missing email or password	172.20.10.4	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	2026-05-10 00:12:43.840449
220	\N	login_failed	Missing email or password	172.20.10.4	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	2026-05-10 00:15:19.804726
221	\N	login_failed	Missing email or password	172.20.10.4	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	2026-05-10 00:15:38.023919
222	\N	login_failed	Missing email or password	172.20.10.4	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	2026-05-10 13:36:51.371606
223	\N	login_failed	Missing email or password	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 09:03:13.308726
224	\N	login_error	Server error	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 09:05:14.891587
225	\N	login_error	Server error	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 09:10:06.353017
226	\N	login_failed	Missing email or password	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 09:11:54.818881
227	\N	login_failed	Missing email or password	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 09:11:55.28357
228	\N	login_failed	Missing email or password	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 09:11:56.202481
229	\N	login_failed	Missing email or password	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 09:12:18.317295
230	\N	login_failed	Missing email or password	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 09:15:14.216389
231	1	login_success	User madonselakamogelo@gmail.com logged in	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 09:22:23.710479
232	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 09:27:53.538984
233	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 09:27:53.825471
234	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 09:27:54.099176
235	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 09:27:54.318824
236	1	avatar_update_success	Uploaded avatar: /uploads/avatars/user_1_avatar_.jpg	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 09:28:17.635251
237	\N	profile_view_failed	Not logged in	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 10:43:30.811303
238	\N	profile_view_failed	Not logged in	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 10:43:30.998409
239	\N	profile_view_failed	Not logged in	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 10:43:46.205155
240	\N	profile_view_failed	Not logged in	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 10:43:46.968924
241	1	login_success	User madonselakamogelo@gmail.com logged in	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 10:50:19.626166
242	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 10:50:23.746361
243	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 10:50:24.104374
244	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 10:50:24.392338
245	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 10:50:24.652596
246	\N	profile_view_failed	Not logged in	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 12:39:48.103796
247	\N	profile_view_failed	Not logged in	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 12:39:48.273848
248	\N	profile_view_failed	Not logged in	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 12:43:08.996115
249	1	login_success	User madonselakamogelo@gmail.com logged in	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 13:14:44.787436
250	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 13:14:48.477473
251	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 13:14:49.011808
252	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 13:14:49.4396
253	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 13:14:50.080902
254	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 13:31:26.391004
255	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 13:31:26.79647
256	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 13:31:27.34722
257	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 13:31:27.513449
258	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 15:01:49.315618
259	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 15:01:50.063925
260	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 15:01:51.531011
261	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 15:01:51.885234
262	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 15:30:37.120391
263	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 15:30:37.418246
264	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 15:30:37.599849
265	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 15:30:37.819072
266	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 15:36:06.930307
267	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 15:36:07.106515
268	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 15:36:07.645652
269	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 15:36:07.813026
270	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 15:36:13.419734
271	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 15:36:13.593559
272	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 15:36:13.791705
273	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 15:36:13.986166
274	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 15:36:33.541995
275	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 15:36:33.717668
276	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 15:36:34.02201
277	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 15:36:34.201038
278	5	login_success	User noautoyves@gmail.com logged in	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 16:09:27.609969
312	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:26:12.127281
279	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 16:09:31.17283
280	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 16:09:31.185974
281	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 16:09:31.436869
282	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 16:09:31.447495
283	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 16:09:36.683766
284	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 16:09:37.71687
285	5	exercise_list_view	Viewed accounting exercises: 1/1 completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 16:09:37.85475
286	5	exercise_list_view	Viewed accounting exercises: 1/1 completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 16:09:37.855771
287	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 16:09:41.267387
288	5	results_view	Viewed results for exercise 1 - Score: 9/10	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 16:09:41.283713
289	5	results_view	Viewed results for exercise 1 - Score: 9/10	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 16:09:41.295609
290	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 16:10:13.520231
291	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 16:10:13.533051
292	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 16:10:13.714045
293	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 16:10:13.728861
294	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 16:10:56.199314
295	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 16:10:56.21684
296	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 16:10:56.408521
297	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 16:10:56.414093
298	1	login_success	User madonselakamogelo@gmail.com logged in	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:17:38.795314
299	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:23:25.085728
300	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:23:25.444773
301	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:23:27.334935
302	1	exercise_list_view	Viewed accounting exercises: 1/1 completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:23:27.505789
303	1	exercise_list_view	Viewed accounting exercises: 1/1 completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:23:27.885156
304	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:23:35.893458
305	1	exercise_started	Started exercise 1 for subject accounting	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:23:35.956254
306	1	exercise_started	Started exercise 1 for subject accounting	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:23:36.155017
307	1	exercise_retake	Retake #8 of exercise 1 - Score: 2/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:23:53.691457
308	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:23:53.760229
309	1	exercise_retake	Retake #8 of exercise 1 - Score: 2/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:23:53.792532
310	1	exercise_retake	Retake #8 of exercise 1 - Score: 2/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:23:53.87709
311	1	feedback_submitted	Rated exercise 1: 4/5	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:24:15.089782
313	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:26:12.336387
314	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:26:12.503371
315	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:26:20.240941
316	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:26:22.079441
317	1	exercise_list_view	Viewed accounting exercises: 1/1 completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:26:22.441277
318	1	exercise_list_view	Viewed accounting exercises: 1/1 completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:26:22.992045
319	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:26:25.256047
320	1	results_view	Viewed results for exercise 1 - Score: 2/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:26:25.344946
321	1	results_view	Viewed results for exercise 1 - Score: 2/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:26:25.625925
322	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 21:27:57.286459
323	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 21:27:57.295308
324	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 21:27:57.581276
325	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 21:27:57.682522
326	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 21:28:12.434398
327	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 21:28:12.447992
328	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 21:28:12.617658
329	5	profile_view	Profile viewed - 1 exercises completed	172.20.10.1	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	2026-05-11 21:28:12.766857
330	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:11.945678
331	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:12.170628
332	1	results_view	Viewed results for exercise 1 - Score: 2/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:12.22749
333	1	results_view	Viewed results for exercise 1 - Score: 2/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:12.501135
334	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:24.681682
335	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:26.3841
336	1	exercise_list_view	Viewed accounting exercises: 1/1 completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:26.528783
337	1	exercise_list_view	Viewed accounting exercises: 1/1 completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:26.906196
338	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:29.695466
339	1	results_view	Viewed results for exercise 1 - Score: 2/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:29.716855
340	1	results_view	Viewed results for exercise 1 - Score: 2/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:29.87835
341	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:35.117079
342	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:35.375562
343	1	exercise_list_failed	Subject not found: business	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:35.410217
344	1	exercise_list_failed	Subject not found: business	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:35.594001
345	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:40.645036
346	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:40.814101
347	1	exercise_list_view	Viewed accounting exercises: 1/1 completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:41.030074
348	1	exercise_list_view	Viewed accounting exercises: 1/1 completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:41.566964
349	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:47.662564
350	1	exercise_started	Started exercise 1 for subject accounting	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:47.686422
351	1	exercise_started	Started exercise 1 for subject accounting	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:30:47.8728
352	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:31:30.518663
353	1	exercise_retake	Retake #9 of exercise 1 - Score: 10/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:31:30.640976
354	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:35:47.478658
355	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:35:47.68301
356	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:35:49.695825
357	1	exercise_list_view	Viewed accounting exercises: 1/1 completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:35:49.847118
358	1	exercise_list_view	Viewed accounting exercises: 1/1 completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:35:50.159306
359	1	results_view	Viewed results for exercise 1 - Score: 10/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:35:52.963953
360	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:35:52.972791
361	1	results_view	Viewed results for exercise 1 - Score: 10/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:35:53.129904
362	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:48:40.527959
363	1	results_view	Viewed results for exercise 1 - Score: 10/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:48:40.958697
364	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:48:41.009009
365	1	results_view	Viewed results for exercise 1 - Score: 10/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:48:41.158309
366	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 23:26:38.802158
367	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 23:26:38.995788
368	1	results_view	Viewed results for exercise 1 - Score: 10/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 23:26:39.512772
369	1	results_view	Viewed results for exercise 1 - Score: 10/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 23:26:39.719325
370	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 09:33:25.728323
371	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 09:33:26.161653
372	1	results_view	Viewed results for exercise 1 - Score: 10/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 09:33:26.217474
373	1	results_view	Viewed results for exercise 1 - Score: 10/10	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 09:33:26.422807
374	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 09:33:30.312272
375	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 09:33:30.651955
376	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 09:33:32.375518
377	1	exercise_list_view	Viewed accounting exercises: 1/1 completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 09:33:32.627258
378	1	exercise_list_view	Viewed accounting exercises: 1/1 completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 09:33:33.019219
379	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 09:33:35.223557
380	1	exercise_started	Started exercise 1 for subject accounting	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 09:33:35.275561
381	1	exercise_started	Started exercise 1 for subject accounting	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 09:33:35.471151
382	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 09:37:39.510459
383	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 09:37:39.949569
384	1	exercise_started	Started exercise 1 for subject accounting	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 09:37:39.978423
385	1	exercise_started	Started exercise 1 for subject accounting	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 09:37:40.269371
386	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 09:52:03.529428
387	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 09:52:03.797527
388	1	exercise_started	Started exercise 1 for subject accounting	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 09:52:03.863971
389	1	exercise_started	Started exercise 1 for subject accounting	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 09:52:04.088996
390	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:06:51.579329
391	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:06:51.943923
392	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:07:45.9081
393	1	exercise_list_view	Viewed accounting exercises: 1/1 completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:07:46.283994
394	1	exercise_list_view	Viewed accounting exercises: 1/1 completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:07:46.695049
395	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:07:52.248507
396	1	exercise_started	Started exercise 1 for subject accounting	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:07:52.285878
397	1	exercise_started	Started exercise 1 for subject accounting	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:07:52.492625
398	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:28:10.5122
399	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:28:10.764968
400	1	admin_stats_view	Stats: 3 users, 1 exercises	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:28:11.000361
401	1	admin_stats_view	Stats: 3 users, 1 exercises	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:28:11.297106
402	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:28:14.29768
403	1	admin_grades_view	Viewed 5 grades	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:28:14.343614
404	1	admin_terms_view	Viewed 4 terms	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:28:14.419768
405	1	admin_list_exercises	Listed 1 exercises	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:28:14.452603
406	1	admin_subjects_view	Viewed 8 subjects	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:28:14.497661
407	1	admin_grades_view	Viewed 5 grades	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:28:14.749348
408	1	admin_terms_view	Viewed 4 terms	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:28:14.788434
409	1	admin_list_exercises	Listed 1 exercises	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:28:14.830267
410	1	admin_subjects_view	Viewed 8 subjects	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:28:14.868351
411	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:31:33.288588
412	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:31:33.544091
413	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:31:33.717557
414	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:41:57.818432
415	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:41:58.113422
416	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:41:58.287079
417	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:41:58.448641
418	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:46:41.337492
419	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:46:41.48331
420	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:46:41.63051
421	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:46:41.787295
422	1	profile_view	Profile viewed - 1 exercises completed	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:47:32.680998
423	1	admin_grades_view	Viewed 5 grades	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:47:32.802825
424	1	admin_subjects_view	Viewed 8 subjects	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:47:32.812699
425	1	admin_terms_view	Viewed 4 terms	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:47:32.854882
426	1	admin_list_exercises	Listed 1 exercises	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:47:32.924491
428	1	admin_subjects_view	Viewed 8 subjects	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:47:33.267665
427	1	admin_grades_view	Viewed 5 grades	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:47:33.267769
429	1	admin_terms_view	Viewed 4 terms	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:47:33.296858
430	1	admin_list_exercises	Listed 1 exercises	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 10:47:33.306647
\.


--
-- Data for Name: admin_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_logs (admin_log_id, admin_id, action, target_user_id, target_exercise_id, details, ip_address, created_at) FROM stdin;
\.


--
-- Data for Name: exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exercises (exercise_id, subject_id, grade_id, term_id, topic_id, exercise_name, exercise_title, total_questions, passing_score, is_published, display_order, created_at, updated_at) FROM stdin;
1	1	3	1	1	accounting_basics_exercise_1	Accounting Basics - Exercise 1	10	70	t	0	2026-05-07 10:35:04.583875	2026-05-07 10:35:04.583875
\.


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grades (grade_id, grade_level, display_name) FROM stdin;
1	8	Grade 8
2	9	Grade 9
3	10	Grade 10
4	11	Grade 11
5	12	Grade 12
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.questions (question_id, exercise_id, question_text, option_a, option_b, option_c, option_d, correct_answer, marks, display_order, image_data, image_mime_type) FROM stdin;
1	1	What is the fundamental accounting equation?	Assets = Liabilities - Equity	Assets = Liabilities + Equity	Assets + Liabilities = Equity	Assets - Equity = Liabilities	B	1	1	\N	\N
2	1	What does a debit entry do to an asset account?	Increases it	Decreases it	No effect	Reverses it	A	1	2	\N	\N
3	1	What does a credit entry do to a liability account?	Decreases it	No effect	Increases it	Reverses it	C	1	3	\N	\N
4	1	Which financial statement shows a company's profitability over time?	Balance Sheet	Statement of Cash Flows	Income Statement	Trial Balance	C	1	4	\N	\N
5	1	What is the normal balance of an expense account?	Credit	Debit	Zero	Neither	B	1	5	\N	\N
6	1	Which accounting concept assumes a business will continue operating indefinitely?	Consistency	Prudence	Going Concern	Materiality	C	1	6	\N	\N
7	1	What is the purpose of a trial balance?	To show profit/loss	To list all accounts with their balances	To prepare financial statements	To record transactions	B	1	7	\N	\N
8	1	When are revenues recognized under accrual accounting?	When cash is received	When earned regardless of cash	At the end of the year	When invoiced	B	1	8	\N	\N
9	1	What is depreciation?	Increase in asset value	Allocation of asset cost over useful life	Repair cost of asset	Tax on assets	B	1	9	\N	\N
10	1	What is the accounting equation after a company pays rent expense?	Assets decrease, Equity decreases	Assets increase, Liabilities increase	Assets decrease, Liabilities decrease	Only Assets change	A	1	10	\N	\N
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects (subject_id, subject_name, subject_code, icon, description, display_order, is_active) FROM stdin;
1	Accounting	ACC	\N	\N	1	t
2	Business Studies	BUS	\N	\N	2	t
3	Economics	ECO	\N	\N	3	t
4	Mathematics	MAT	\N	\N	4	t
5	Mathematical Literacy	MLIT	\N	\N	5	t
6	Geography	GEO	\N	\N	6	t
7	Biology	BIO	\N	\N	7	t
8	Physics	PHY	\N	\N	8	t
\.


--
-- Data for Name: terms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.terms (term_id, term_name, display_order) FROM stdin;
1	Term 1	1
2	Term 2	2
3	Term 3	3
4	Term 4	4
\.


--
-- Data for Name: topics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.topics (topic_id, subject_id, topic_name, description, display_order) FROM stdin;
1	1	Accounting Basics	\N	0
\.


--
-- Data for Name: user_feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_feedback (id, user_id, exercise_id, rating, feedback, score, total_questions, time_taken_seconds, ip_address, user_agent, created_at) FROM stdin;
1	1	1	4	Really tough exercise	2	10	16	172.20.10.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-11 21:24:15.013779
\.


--
-- Data for Name: user_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_notes (note_id, user_id, exercise_id, note_text, created_at) FROM stdin;
\.


--
-- Data for Name: user_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_progress (progress_id, user_id, exercise_id, score, total_questions, percentage, time_taken_seconds, answers, completed_at, retake_count) FROM stdin;
5	5	1	9	10	90.00	33	{"answers": {}, "breakdown": [{"correct": "Assets = Liabilities + Equity", "question": "What is the fundamental accounting equation?", "selected": "Assets = Liabilities + Equity", "isCorrect": true}, {"correct": "Increases it", "question": "What does a debit entry do to an asset account?", "selected": "Increases it", "isCorrect": true}, {"correct": "Increases it", "question": "What does a credit entry do to a liability account?", "selected": "Increases it", "isCorrect": true}, {"correct": "Income Statement", "question": "Which financial statement shows a company's profitability over time?", "selected": "Income Statement", "isCorrect": true}, {"correct": "Debit", "question": "What is the normal balance of an expense account?", "selected": "Debit", "isCorrect": true}, {"correct": "Going Concern", "question": "Which accounting concept assumes a business will continue operating indefinitely?", "selected": "Going Concern", "isCorrect": true}, {"correct": "To list all accounts with their balances", "question": "What is the purpose of a trial balance?", "selected": "To list all accounts with their balances", "isCorrect": true}, {"correct": "When earned regardless of cash", "question": "When are revenues recognized under accrual accounting?", "selected": "When earned regardless of cash", "isCorrect": true}, {"correct": "Allocation of asset cost over useful life", "question": "What is depreciation?", "selected": "Allocation of asset cost over useful life", "isCorrect": true}, {"correct": "Assets decrease, Equity decreases", "question": "What is the accounting equation after a company pays rent expense?", "selected": "Assets decrease, Liabilities decrease", "isCorrect": false}]}	2026-05-08 10:16:29.166257	0
3	1	1	10	10	100.00	41	{"answers": {}, "breakdown": [{"correct": "Assets = Liabilities + Equity", "question": "What is the fundamental accounting equation?", "selected": "Assets = Liabilities + Equity", "isCorrect": true}, {"correct": "Increases it", "question": "What does a debit entry do to an asset account?", "selected": "Increases it", "isCorrect": true}, {"correct": "Increases it", "question": "What does a credit entry do to a liability account?", "selected": "Increases it", "isCorrect": true}, {"correct": "Income Statement", "question": "Which financial statement shows a company's profitability over time?", "selected": "Income Statement", "isCorrect": true}, {"correct": "Debit", "question": "What is the normal balance of an expense account?", "selected": "Debit", "isCorrect": true}, {"correct": "Going Concern", "question": "Which accounting concept assumes a business will continue operating indefinitely?", "selected": "Going Concern", "isCorrect": true}, {"correct": "To list all accounts with their balances", "question": "What is the purpose of a trial balance?", "selected": "To list all accounts with their balances", "isCorrect": true}, {"correct": "When earned regardless of cash", "question": "When are revenues recognized under accrual accounting?", "selected": "When earned regardless of cash", "isCorrect": true}, {"correct": "Allocation of asset cost over useful life", "question": "What is depreciation?", "selected": "Allocation of asset cost over useful life", "isCorrect": true}, {"correct": "Assets decrease, Equity decreases", "question": "What is the accounting equation after a company pays rent expense?", "selected": "Assets decrease, Equity decreases", "isCorrect": true}]}	2026-05-11 21:31:30.462686	9
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, email, password_hash, first_name, last_name, username, bio, avatar, phone, country, is_active, is_verified, is_admin, verification_token, reset_token, reset_token_expires, created_at, last_login, updated_at) FROM stdin;
5	noautoyves@gmail.com	$2b$12$3UZuK5wf6im6cdMJNAY3qOaO86UwKUOFOwWogmiVQ0PUlL2l1fn9y	No	Auto	noautoyves	\N	/uploads/avatars/user_5_avatar_.jpg	\N	\N	t	f	f	\N	\N	\N	2026-05-08 10:15:09.063337	\N	2026-05-08 10:15:09.063337
6	nhlanhlamahlangu698@gmail.com	$2b$12$YlN9bAU4SpILghhjxIHFsOscH0r9syPjt3Qky0MsIxIKg26mEMHVq	Tiffany 	Mahlangu	BigMamaZ	\N	/uploads/avatars/user_6_avatar_.jpg	\N	\N	t	f	f	\N	\N	\N	2026-05-08 17:19:41.605694	\N	2026-05-08 17:22:11.011036
1	madonselakamogelo@gmail.com	$2b$12$mBMrYMWgoxLY47Q.lWMoIuvyV9VlgGXNJf4nU7Q34AExjGpZGeuYm	Kamogelo	Madonsela	madonselakamogelo	Grade 10 Student	/uploads/avatars/user_1_avatar_.jpg	\N	\N	t	t	t	\N	ImRT1UsmsWge7rUNlr3irV-bUBgVwz1abxi0-3bWL3Y	2026-05-08 18:13:40.490699	2026-05-06 01:49:31.065867	\N	2026-05-07 14:26:22.02528
\.


--
-- Name: activity_logs_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_logs_log_id_seq', 430, true);


--
-- Name: admin_logs_admin_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_logs_admin_log_id_seq', 1, false);


--
-- Name: exercises_exercise_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exercises_exercise_id_seq', 1, true);


--
-- Name: grades_grade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grades_grade_id_seq', 5, true);


--
-- Name: questions_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.questions_question_id_seq', 10, true);


--
-- Name: subjects_subject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subjects_subject_id_seq', 9, true);


--
-- Name: terms_term_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.terms_term_id_seq', 4, true);


--
-- Name: topics_topic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.topics_topic_id_seq', 1, true);


--
-- Name: user_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_feedback_id_seq', 1, true);


--
-- Name: user_notes_note_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_notes_note_id_seq', 1, false);


--
-- Name: user_progress_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_progress_progress_id_seq', 5, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 6, true);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (log_id);


--
-- Name: admin_logs admin_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_pkey PRIMARY KEY (admin_log_id);


--
-- Name: exercises exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_pkey PRIMARY KEY (exercise_id);


--
-- Name: grades grades_grade_level_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_grade_level_key UNIQUE (grade_level);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (grade_id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (question_id);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (subject_id);


--
-- Name: subjects subjects_subject_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_subject_name_key UNIQUE (subject_name);


--
-- Name: terms terms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.terms
    ADD CONSTRAINT terms_pkey PRIMARY KEY (term_id);


--
-- Name: terms terms_term_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.terms
    ADD CONSTRAINT terms_term_name_key UNIQUE (term_name);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (topic_id);


--
-- Name: topics topics_subject_id_topic_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_subject_id_topic_name_key UNIQUE (subject_id, topic_name);


--
-- Name: user_feedback user_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_pkey PRIMARY KEY (id);


--
-- Name: user_notes user_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notes
    ADD CONSTRAINT user_notes_pkey PRIMARY KEY (note_id);


--
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (progress_id);


--
-- Name: user_progress user_progress_user_id_exercise_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_exercise_id_key UNIQUE (user_id, exercise_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_feedback_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_feedback_created_at ON public.user_feedback USING btree (created_at);


--
-- Name: idx_feedback_exercise_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_feedback_exercise_id ON public.user_feedback USING btree (exercise_id);


--
-- Name: idx_feedback_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_feedback_user_id ON public.user_feedback USING btree (user_id);


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: admin_logs admin_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: exercises exercises_grade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_grade_id_fkey FOREIGN KEY (grade_id) REFERENCES public.grades(grade_id);


--
-- Name: exercises exercises_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id);


--
-- Name: exercises exercises_term_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_term_id_fkey FOREIGN KEY (term_id) REFERENCES public.terms(term_id);


--
-- Name: exercises exercises_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id);


--
-- Name: questions questions_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id) ON DELETE CASCADE;


--
-- Name: topics topics_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id);


--
-- Name: user_feedback user_feedback_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id) ON DELETE SET NULL;


--
-- Name: user_feedback user_feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: user_notes user_notes_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notes
    ADD CONSTRAINT user_notes_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id) ON DELETE CASCADE;


--
-- Name: user_notes user_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notes
    ADD CONSTRAINT user_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict hD1zCEdw0BgxGMC2BuF1ccXLONZHbApF1W3FDqZ20IoQD9ygUIfssx02i2VWDcY

