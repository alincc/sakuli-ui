package org.sweetest.platform.server.web;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.sweetest.platform.server.api.project.ProjectService;
import org.sweetest.platform.server.api.runconfig.RunConfiguration;
import org.sweetest.platform.server.api.runconfig.dockerhub.*;
import org.sweetest.platform.server.service.test.execution.config.SakuliRunConfigService;

import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/api/run-configuration")
public class RunConfigController {

    @Autowired
    private SakuliRunConfigService runConfigService;

    @Autowired
    private ProjectService projectService;

    private RestTemplate restTemplate = new RestTemplate();

    @GetMapping
    @ResponseBody
    public RunConfiguration getRunConfiguration() {
        return runConfigService.getRunConfigFromProject(
                projectService.getActiveProject()
        );
    }

    @PostMapping
    @ResponseBody
    public ResponseEntity setRunConfiguration(@RequestBody RunConfiguration runConfiguration) {
        boolean success = this.runConfigService
                .setRunConfigurationToProject(
                        runConfiguration,
                        projectService.getActiveProject()
                );
        return success ?
                ResponseEntity.ok().build() :
                ResponseEntity.unprocessableEntity().build();
    }

    @GetMapping("sakuli-container")
    @ResponseBody
    public List<DockerHubRepository> getSakuliRepositories() {
        return restTemplate
                .getForObject("https://hub.docker.com/v2/repositories/consol/?page=1&page_size=250", DockerHubRepositoryResponse.class)
                .getResults()
                .stream()
                .filter(r -> r.getName().startsWith("sakuli"))
                .collect(Collectors.toList());
    }

    @GetMapping("sakuli-container/{container}/tags")
    @ResponseBody
    public List<DockerHubTag> getSakuliRepositoryTags(@PathVariable("container") String containerId) {
        return restTemplate.getForObject(
                "https://hub.docker.com/v2/repositories/consol/" + containerId + "/tags/?page=1&page_size=250",
                DockerHubTagResponse.class
        )
                .getResults();
    }
}
