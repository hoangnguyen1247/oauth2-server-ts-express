--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: oauth_tokens; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE oauth_tokens (
    id uuid NOT NULL,
    accessToken text NOT NULL,
    accessTokenExpiresOn timestamp without time zone NOT NULL,
    clientId text NOT NULL,
    refreshToken text NOT NULL,
    refreshTokenExpiresOn timestamp without time zone NOT NULL,
    userId uuid NOT NULL
);


--
-- Name: oauth_clients; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE oauth_clients (
    clientId text NOT NULL,
    clientSecret text NOT NULL,
    redirectUri text NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE users (
    id uuid NOT NULL,
    username text NOT NULL,
    password text NOT NULL
);


--
-- Name: oauth_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY oauth_tokens
    ADD CONSTRAINT oauth_tokens_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (clientId, clientSecret);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_username_password; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX users_username_password ON users USING btree (username, password);


--
-- PostgreSQL database dump complete
--

