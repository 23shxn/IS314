package com.grp12;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        System.setProperty("spring.web.resources.add-mappings", "false");
        System.setProperty("spring.autoconfigure.exclude", "org.springframework.boot.autoconfigure.web.servlet.error.ErrorMvcAutoConfiguration");
        
        SpringApplication.run(BackendApplication.class, args);
    }
}
