package com.csms.priority.entity;

import com.csms.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "priorities")
@Getter
@Setter
@NoArgsConstructor
public class Priority extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "display_color", length = 20)
    private String displayColor;
}
