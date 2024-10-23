--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.4

-- Started on 2024-10-19 22:56:35 +08

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 24747)
-- Name: request; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.request (
    request_id integer NOT NULL,
    staff_id integer NOT NULL,
    department character varying(50) NOT NULL,
    reason character varying(50) NOT NULL,
    status character varying(50) NOT NULL,
    reporting_manager_id integer NOT NULL,
    reporting_manager_name character varying(50) NOT NULL,
    reporting_manager_email character varying(50) NOT NULL,
    requester_email character varying(50) NOT NULL,
    approver_comment character varying(50),
    requested_dates date[],
    time_of_day character varying(10) DEFAULT 'Full Day'::character varying
);


ALTER TABLE public.request OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24769)
-- Name: request_request_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.request_request_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.request_request_id_seq OWNER TO postgres;

--
-- TOC entry 4304 (class 0 OID 0)
-- Dependencies: 221
-- Name: request_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.request_request_id_seq OWNED BY public.request.request_id;


--
-- TOC entry 4152 (class 2604 OID 24770)
-- Name: request request_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request ALTER COLUMN request_id SET DEFAULT nextval('public.request_request_id_seq'::regclass);


--
-- TOC entry 4155 (class 2606 OID 24754)
-- Name: request request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request
    ADD CONSTRAINT request_pkey PRIMARY KEY (request_id);


-- Completed on 2024-10-19 22:56:36 +08

--
-- PostgreSQL database dump complete
--

