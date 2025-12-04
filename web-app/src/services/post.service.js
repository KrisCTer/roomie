// src/services/post.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const getMyPosts = (page = 0, size = 10) =>
  BaseService.get(API.MY_POST, { page, size });

export const createPost = (content) =>
  BaseService.post(API.CREATE_POST, { content });
