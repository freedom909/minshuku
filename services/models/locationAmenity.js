
LocationAmenity.init({

  locationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Location',
      key: 'id'
    }
  },
  amenityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Amenity',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'LocationAmenity',
  tableName: 'location_amenities',
  timestamps: false
});

LocationAmenity.associate = (models) => {
  LocationAmenity.belongsTo(models.Location, {
    foreignKey: 'locationId',
    as: 'location'
  });
  LocationAmenity.belongsTo(models.Amenity, {
    foreignKey: 'amenityId',
    as: 'amenity'
  });
};

