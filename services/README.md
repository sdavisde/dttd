# DTTD > Services

## Overview

This directory contains the services for the DTTD application.

Services are intended to provide *business logic* around our database calls, so that the frontend doesn't have to do as much work. Think normalization of nil values, transformations of related entities into shared DTOs for consumption, or handling updating multiple tables in a single action without the frontend needing to know about the complexity of the database schema.

## Purpose

In NextJS app router, we use server actions instead of traditional fetch calls to a server
to fetch and POST data. This is because server actions are cached and can be used on the client side.

To support this pattern for React server actions while still maintaining the nice separation of concerns that we get with traditional API frameworks like Spring or .NET, we use the services pattern in this directory.

## Structure

A service is comprised of 4 files:

1. A server action file

This file is used to define the server action and is the entry point for the service.

2. A service file

This file is used to define the business logic for the "endpoints" and is the main file for the service.

3. A repository file

This file is used to define the data access - it accesses supabase, and that is its only purpose. This is where we should aim to make any db performance enhancements.

4. A types file

This file is used to define the types needed and defined for the service. 
Optimally these types will be entirely internal and not imported to the client.
