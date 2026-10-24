package com.cafeguide;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class CafeGuideApplicationTests {
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper json;

  @Test void servesFrontend() throws Exception {
    mvc.perform(get("/index.html")).andExpect(status().isOk()).andExpect(content().string(org.hamcrest.Matchers.containsString("Cafe Guide")));
  }

  @Test void menuSupportsSearchAndCategories() throws Exception {
    mvc.perform(get("/api/menu").param("search","espresso")).andExpect(status().isOk()).andExpect(jsonPath("$[0].name").value("Classic Espresso"));
    mvc.perform(get("/api/menu").param("category","Coffee")).andExpect(status().isOk()).andExpect(jsonPath("$[0].cat").value("Coffee"));
  }

  @Test void cartRecalculatesTotalsOnServer() throws Exception {
    mvc.perform(post("/api/cart/items").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{\"itemId\":1,\"quantity\":2}"))
      .andExpect(status().isOk()).andExpect(jsonPath("$.subtotal").value(300.0)).andExpect(jsonPath("$.total").value(315.0));
  }

  @Test void feedbackCanBeSubmittedAndReadBack() throws Exception {
    mvc.perform(post("/api/reviews").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Test Guest\",\"rating\":5,\"text\":\"Lovely coffee and a calm ocean view.\"}"))
      .andExpect(status().isCreated()).andExpect(jsonPath("$.sample").value(false));
    mvc.perform(get("/api/reviews")).andExpect(status().isOk()).andExpect(jsonPath("$.count").value(3)).andExpect(jsonPath("$.items[0].name").value("Test Guest"));
  }

  @Test void gameSessionCanStartAndRejectsImpossibleScore() throws Exception {
    MvcResult started=mvc.perform(post("/api/game-sessions").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{\"game\":\"BUBBLES\"}"))
      .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ACTIVE")).andReturn();
    String id=json.readTree(started.getResponse().getContentAsString()).get("id").asText();
    mvc.perform(post("/api/game-sessions/"+id+"/complete").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{\"score\":100001,\"durationSeconds\":30}"))
      .andExpect(status().isBadRequest());
  }

  @Test void offersExposeTimezoneAndWednesdayPreview() throws Exception {
    mvc.perform(get("/api/offers/wednesday")).andExpect(status().isOk()).andExpect(jsonPath("$.timezone").value("Asia/Kolkata")).andExpect(jsonPath("$.nextWednesday").isNotEmpty());
  }

  @Test void signedInCustomerCanSeeTheirReservations() throws Exception {
    MvcResult registered=mvc.perform(post("/api/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON)
      .content("{\"name\":\"Profile Guest\",\"email\":\"profile@example.test\",\"password\":\"Cafe@123\"}"))
      .andExpect(status().isCreated()).andReturn();
    MockHttpSession session=(MockHttpSession)registered.getRequest().getSession(false);
    String date=java.time.LocalDate.now(java.time.ZoneId.of("Asia/Kolkata")).plusDays(1).toString();
    String reservation=json.writeValueAsString(java.util.Map.of("name","Profile Guest","phone","+911234567890","email","profile@example.test","date",date,"time","18:30","guests",3,"seating","Outdoor"));
    mvc.perform(post("/api/reservations").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(reservation))
      .andExpect(status().isCreated());
    mvc.perform(get("/api/reservations/mine").session(session))
      .andExpect(status().isOk()).andExpect(jsonPath("$[0].email").value("profile@example.test"))
      .andExpect(jsonPath("$[0].guests").value(3));
  }}
