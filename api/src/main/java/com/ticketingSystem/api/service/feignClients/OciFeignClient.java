//package com.ticketingSystem.api.service.feignClients;
//
//import org.springframework.cloud.openfeign.FeignClient;
//import org.springframework.http.MediaType;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.Map;
//
//@FeignClient(
//        name = "ociFeignClient",
//        url = "https://objectstorage.${oci.region}.oraclecloud.com",
//        configuration = OciFeignConfig.class
//)
//public interface OciFeignClient {
//
//    @PutMapping(
//            value = "/n/{namespace}/b/{bucket}/o/{objectName}",
//            consumes = MediaType.APPLICATION_OCTET_STREAM_VALUE
//    )
//    ResponseEntity<String> uploadObject(
//            @RequestHeader Map<String, String> headers,
//            @PathVariable("namespace") String namespace,
//            @PathVariable("bucket") String bucket,
//            @PathVariable("objectName") String objectName,
//            @RequestBody byte[] content
//    );
//
//    @PostMapping(
//            value = "/n/{namespace}/b/{bucket}/p",
//            consumes = MediaType.APPLICATION_JSON_VALUE,
//            produces = MediaType.APPLICATION_JSON_VALUE
//    )
//    ResponseEntity<String> createPreauthenticatedRequest(
//            @RequestHeader Map<String, String> headers,
//            @PathVariable("namespace") String namespace,
//            @PathVariable("bucket") String bucket,
//            @RequestBody String createPreauthenticatedRequestDetails
//    );
//}
