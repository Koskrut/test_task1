import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { GeofenceHit } from '../gps.types';
import { GeofencesRepository } from '../repositories/geofences.repository';

@Injectable()
export class PrismaGeofencesRepository implements GeofencesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findInsideGeofences(
    managerId: string,
    lat: number,
    lng: number,
  ): Promise<GeofenceHit[]> {
    return this.prisma.$queryRaw<GeofenceHit[]>`
      SELECT
        g.id AS "geofenceId",
        g.client_id AS "clientId"
      FROM geofences g
      JOIN crm_clients c ON c.id = g.client_id
      WHERE c.assigned_manager_id = ${managerId}
        AND (
          (g.geom IS NOT NULL AND ST_Contains(
            g.geom,
            ST_SetSRID(ST_Point(${lng}, ${lat}), 4326)
          ))
          OR
          (g.geom IS NULL
            AND g.center_lat IS NOT NULL
            AND g.center_lng IS NOT NULL
            AND g.radius_m IS NOT NULL
            AND ST_DWithin(
              geography(ST_SetSRID(ST_Point(g.center_lng, g.center_lat), 4326)),
              geography(ST_SetSRID(ST_Point(${lng}, ${lat}), 4326)),
              g.radius_m
            )
          )
        )
    `;
  }

  async isPointInsideGeofence(
    geofenceId: string,
    lat: number,
    lng: number,
  ): Promise<boolean> {
    const rows = await this.prisma.$queryRaw<{ inside: boolean }[]>`
      SELECT (
        (g.geom IS NOT NULL AND ST_Contains(
          g.geom,
          ST_SetSRID(ST_Point(${lng}, ${lat}), 4326)
        ))
        OR
        (g.geom IS NULL
          AND g.center_lat IS NOT NULL
          AND g.center_lng IS NOT NULL
          AND g.radius_m IS NOT NULL
          AND ST_DWithin(
            geography(ST_SetSRID(ST_Point(g.center_lng, g.center_lat), 4326)),
            geography(ST_SetSRID(ST_Point(${lng}, ${lat}), 4326)),
            g.radius_m
          )
        )
      ) AS inside
      FROM geofences g
      WHERE g.id = ${geofenceId}
      LIMIT 1
    `;

    return rows[0]?.inside ?? false;
  }

  async isManagerAssignedToClient(
    managerId: string,
    clientId: string,
  ): Promise<boolean> {
    const rows = await this.prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1
        FROM crm_clients
        WHERE id = ${clientId}
          AND assigned_manager_id = ${managerId}
      ) AS "exists"
    `;

    return rows[0]?.exists ?? false;
  }
}
