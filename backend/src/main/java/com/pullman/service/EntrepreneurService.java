package com.pullman.service;

import com.pullman.domain.Entrepreneur;
import com.pullman.repository.EntrepreneurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EntrepreneurService {
    @Autowired
    private EntrepreneurRepository entrepreneurRepository;

    public List<Entrepreneur> findAll() {
        return entrepreneurRepository.findAll();
    }

    public Optional<Entrepreneur> findById(Long id) {
        return entrepreneurRepository.findById(id);
    }

    public Entrepreneur save(Entrepreneur entrepreneur) {
        return entrepreneurRepository.save(entrepreneur);
    }

    public void deleteById(Long id) {
        entrepreneurRepository.deleteById(id);
    }
} 