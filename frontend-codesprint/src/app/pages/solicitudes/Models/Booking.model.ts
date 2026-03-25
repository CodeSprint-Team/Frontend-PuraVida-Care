export type BookingStatus = 'pending' | 'accepted' | 'rejected';

export interface Booking {
  id:               number;
  clientProfileId:  number;
  clientName:       string;
  clientPhone:      string;
  seniorProfileId:  number;
  seniorName:       string;
  careServiceId:    number;
  serviceName:      string;
  serviceCategory:  string;
  scheduledAt:      string;  
  agreedPrice:      number;
  agreedPriceMode:  string;
  bookingStatus:    BookingStatus;
  rejectionReason?: string;
  requestDate:      string;  
}

export interface BookingStatusUpdateDTO {
  status:           'accepted' | 'rejected';
  rejectionReason?: string;
}