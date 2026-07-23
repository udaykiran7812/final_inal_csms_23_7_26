package com.csms.asset.repository;

import com.csms.asset.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long> {

    Optional<Asset> findByAssetTag(String assetTag);

    List<Asset> findByActiveTrue();
}
