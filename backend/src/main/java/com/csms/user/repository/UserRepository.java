package com.csms.user.repository;

import com.csms.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    @Query("""
       SELECT u
       FROM User u
       JOIN FETCH u.role
       WHERE u.email = :email
       """)
    Optional<User> findByEmailWithRole(@Param("email") String email);


    boolean existsByEmail(String email);

    List<User> findByRole_NameAndActiveTrue(String roleName);

    List<User> findByRole_NameAndDepartmentIdAndActiveTrue(String roleName, Long departmentId);
}