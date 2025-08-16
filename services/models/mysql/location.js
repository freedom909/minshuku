const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },   
  state: { type: DataTypes.STRING, allowNull: false },  
  zip: { type: DataTypes.STRING, allowNull: false },    
  country: { type: DataTypes.STRING, allowNull: false },    
  latitude: { type: DataTypes.FLOAT, allowNull: false }, 
  longitude: { type: DataTypes.FLOAT, allowNull: false },
  radius: { type: DataTypes.FLOAT, allowNull: true },
  units: { type: DataTypes.STRING, allowNull: true, defaultValue: 'km' },   
});

export default Location;