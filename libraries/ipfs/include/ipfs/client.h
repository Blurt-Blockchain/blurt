 /* Copyright (c) 2016-2021, The C++ IPFS client library developers
  
 Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to deal in
 the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:
  
 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.
  
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. */
  
 #ifndef IPFS_CLIENT_H
 #define IPFS_CLIENT_H
  
 #include <ipfs/http/transport.h>
  
 #include <iostream>
 #include <nlohmann/json.hpp>
 #include <string>
 #include <utility>
 #include <vector>
  
 namespace ipfs {
  
 using Json = nlohmann::json;
  
 class Client {
  public:
   Client(
       const std::string& host,
       long port,
       const std::string& timeout = "",
       const std::string& protocol = "http://",
       const std::string& apiPath = "/api/v0");
  
   Client(
       const Client&);
  
   Client(
       Client&&);
  
   Client& operator=(
       const Client&);
  
   Client& operator=(
       Client&&);
  
   ~Client();
  
   void Id(
       Json* id);
  
   void Version(
       Json* version);
  
   void ConfigGet(
       const std::string& key,
       Json* config);
  
   void ConfigSet(
       const std::string& key,
       const Json& value);
  
   void ConfigReplace(
       const Json& config);
  
   void DhtFindPeer(
       const std::string& peer_id,
       Json* addresses);
  
   void DhtFindProvs(
       const std::string& hash,
       Json* providers);
  
   void BlockGet(
       const std::string& block_id,
       std::iostream* block);
  
   void BlockPut(
       const http::FileUpload& block,
       Json* stat);
  
   void BlockStat(
       const std::string& block_id,
       Json* stat);
  
   void FilesGet(
       const std::string& path,
       std::iostream* response);
  
   void FilesAdd(
       const std::vector<http::FileUpload>& files,
       Json* result);
  
   void FilesLs(
       const std::string& path,
       Json* result);
  
   void KeyGen(
       const std::string& key_name,
       const std::string& key_type,
       size_t key_size,
       std::string* key_id);
  
   void KeyList(
       Json* key_list);
  
   void KeyRm(
       const std::string& key_name);
  
   void NamePublish(
       const std::string& object_id,
       const std::string& key_name,
       const Json& options,
       std::string* name_id);
  
   void NameResolve(
       const std::string& name_id,
       std::string* path_string);
  
   void ObjectNew(
       std::string* object_id);
  
   void ObjectPut(
       const Json& object,
       Json* object_stored);
  
   void ObjectGet(
       const std::string& object_id,
       Json* object);
  
   void ObjectData(
       const std::string& object_id,
       std::string* data);
  
   void ObjectLinks(
       const std::string& object_id,
       Json* links);
  
   void ObjectStat(
       const std::string& object_id,
       Json* stat);
  
   void ObjectPatchAddLink(
       const std::string& source,
       const std::string& link_name,
       const std::string& link_target,
       std::string* cloned);
  
   void ObjectPatchRmLink(
       const std::string& source,
       const std::string& link_name,
       std::string* cloned);
  
   void ObjectPatchAppendData(
       const std::string& source,
       const http::FileUpload& data,
       std::string* cloned);
  
   void ObjectPatchSetData(
       const std::string& source,
       const http::FileUpload& data,
       std::string* cloned);
  
   void PinAdd(
       const std::string& object_id);
  
   void PinLs(
       Json* pinned);
  
   void PinLs(
       const std::string& object_id,
       Json* pinned);
  
   enum class PinRmOptions {
     NON_RECURSIVE,
     RECURSIVE,
   };
  
   void PinRm(
       const std::string& object_id,
       PinRmOptions options);
  
   void StatsBw(
       Json* bandwidth_info);
  
   void SwarmAddrs(
       Json* addresses);
  
   void SwarmConnect(
       const std::string& peer);
  
   void SwarmDisconnect(
       const std::string& peer);
  
   void SwarmPeers(
       Json* peers);
  
  private:
   void FetchAndParseJson(
       const std::string& url,
       Json* response);
  
   void FetchAndParseJson(
       const std::string& url,
       const std::vector<http::FileUpload>& files,
       Json* response);
  
   static void ParseJson(
       const std::string& input,
       Json* result);
  
   template <class PropertyType>
   static void GetProperty(
       const Json& input,
       const std::string& property_name,
       size_t line_number,
       PropertyType* property_value);
  
   std::string MakeUrl(
       const std::string& path,
       const std::vector<std::pair<std::string, std::string>>& parameters = {});
  
   std::string url_prefix_;
  
   http::Transport* http_;
  
   std::string timeout_value_;
 };
 } /* namespace ipfs */
  
 #endif /* IPFS_CLIENT_H */
